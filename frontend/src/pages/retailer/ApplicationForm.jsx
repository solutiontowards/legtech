import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { getServiceOptionDetail, createSubmission } from '../../api/retailer';
import { uploadSingle } from '../../api/upload';
import toast from 'react-hot-toast';
import { Loader2, UploadCloud, FileText, Wallet, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

const renderField = (field, register, errors, setValue, watch) => {
  const fieldName = field.name;
  const errorMessage = errors[fieldName]?.message;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const res = await uploadSingle(file);
      setValue(fieldName, res.data.url, { shouldValidate: true });
      toast.success('File uploaded successfully!', { id: toastId });
    } catch (error) {
      toast.error('File upload failed.', { id: toastId });
      console.error(error);
    }
  };

  const fileUrl = watch(fieldName);

  switch (field.type) {
    case 'file':
      return (
        <div key={field._id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.required && '*'}</label>
          {fileUrl ? (
            <div className="flex items-center gap-3 p-2 border rounded-md bg-gray-50">
              <FileText className="h-6 w-6 text-blue-500" />
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-1">
                {fileUrl.split('/').pop()}
              </a>
              <button type="button" onClick={() => setValue(fieldName, '')} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor={fieldName} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id={fieldName} name={fieldName} type="file" className="sr-only" onChange={handleFileChange} accept={field.accept} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">{field.placeholder || 'Any file up to 10MB'}</p>
              </div>
            </div>
          )}
          {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
        </div>
      );
    case 'textarea':
      return (
        <div key={field._id}>
          <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">{field.label}{field.required && '*'}</label>
          <textarea
            id={fieldName}
            {...register(fieldName, { required: field.required ? `${field.label} is required.` : false })}
            rows="4"
            className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errorMessage ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
          {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
        </div>
      );
    default:
      return (
        <div key={field._id}>
          <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">{field.label}{field.required && '*'}</label>
          <input
            type={field.type}
            id={fieldName}
            {...register(fieldName, { required: field.required ? `${field.label} is required.` : false })}
            className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errorMessage ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
          {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
        </div>
      );
  }
};

const ApplicationForm = () => {
  const { serviceSlug, subServiceSlug, optionSlug } = useParams();
  const navigate = useNavigate();
  const [option, setOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const { data } = await getServiceOptionDetail(serviceSlug, subServiceSlug, optionSlug);
        setOption(data.option);
      } catch (error) {
        toast.error('Failed to load service details.');
        console.error(error);
        navigate('/retailer/services');
      } finally {
        setLoading(false);
      }
    };
    fetchOption();
  }, [serviceSlug, subServiceSlug, optionSlug, navigate]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        optionId: option._id,
        data: formData, // The backend expects 'data', not 'formData'
        paymentMethod: paymentMethod,
      };
      await createSubmission(payload);
      Swal.fire({
        title: 'Success!',
        text: 'Your application has been submitted successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      }).then(() => {
        navigate('/retailer/services');
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Swal.fire({
        title: 'Submission Failed',
        text: errorMessage,
        icon: 'error',
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!option) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl text-gray-700">Service option not found.</h2>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">{option.name}</h1>
            <p className="mt-1 text-md text-gray-500">
              Please fill out the form below to apply for this service.
            </p>
            <p className="mt-4 text-3xl font-extrabold text-blue-600">
              Price: ₹{option.price.toFixed(2)}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Wallet Option */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`relative flex items-center space-x-3 rounded-lg border bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400 cursor-pointer ${paymentMethod === 'wallet' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'}`}
              >
                <div className="flex-shrink-0">
                  <Wallet className="h-6 w-6 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Pay with Wallet</p>
                  <p className="text-sm text-gray-500">Use your available balance.</p>
                </div>
              </div>

              {/* Online Payment (Disabled for now as per logic) */}
              <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-gray-50 px-6 py-5 shadow-sm cursor-not-allowed">
                <p className="text-sm font-medium text-gray-500">Online Payment (Coming Soon)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <div className="space-y-6">
              {option.formFields.length > 0 ? (
                option.formFields.map(field => renderField(field, register, errors, setValue, watch))
              ) : (
                <p className="text-center text-gray-500 py-8">No application fields required for this service.</p>
              )}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !option || option.formFields.length === 0}
                  className="ml-3 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;