import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../../components/FileUpload';
import { submitKyc, getMyKycDetails } from '../../api/retailer';
import { uploadSingle } from '../../api/upload';
import { Loader2, AlertTriangle, CheckCircle, Info, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

const KycPage = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [kycData, setKycData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchKycStatus() {
      try {
        const { data } = await getMyKycDetails();
        setKycData(data);
        const fileFields = ['aadhaarFront', 'aadhaarBack', 'panCardImage', 'photo', 'bankDocument']; // Keep bankDocument here for pre-filling logic
        if (data.details) {
          // Pre-fill form if details exist (for resubmission)
          Object.keys(data.details).forEach(key => {
            // Only pre-fill non-file input fields
            if (!fileFields.includes(key) && key !== 'status' && key !== 'rejectionReason') {
              setValue(key, data.details[key]);
            }
          });
        }
      } catch (error) {
        toast.error('Failed to load your KYC status.');
      } finally {
        setPageLoading(false);
      }
    }
    fetchKycStatus();
  }, [setValue]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLongString = `${latitude}, ${longitude}`;
        setValue('plusCode', latLongString, { shouldValidate: true });
        setLocationLoading(false);
        toast.success("Location captured successfully!");
      },
      () => {
        toast.error("Unable to retrieve your location. Please enable location services.");
        setLocationLoading(false);
      }
    );
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    Swal.fire({
      title: 'Submitting KYC...',
      text: 'Uploading documents and saving details. Please wait.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const fileFields = ['aadhaarFront', 'aadhaarBack', 'panCardImage', 'photo', 'bankDocument']; // bankDocument is optional but needs to be in the upload loop if present
      const uploadPromises = [];
      const payload = { ...formData };

      for (const field of fileFields) {
        if (formData[field]?.[0]) {
          const uploadPromise = uploadSingle(formData[field][0]).then(res => {
            payload[field] = res.data.url;
          });
          uploadPromises.push(uploadPromise);
        } else {
          // If no new file is uploaded but a URL already exists (from a rejected submission), keep it.
          payload[field] = kycData?.details?.[field] || null;
        }
        if (field === 'bankDocument' && !payload[field]) {
          delete payload[field]; // Remove optional field if it's empty
        }
      }

      await Promise.all(uploadPromises);
      await submitKyc(payload);

      Swal.fire({
        title: 'Success!',
        text: 'Your KYC details have been submitted for review.',
        icon: 'success',
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        navigate('/retailer/dashboard');
      });

    } catch (error) {
      Swal.fire({
        title: 'Submission Failed',
        text: error.response?.data?.message || 'An unexpected error occurred.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  }

  if (kycData?.kycStatus === 'approved') {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md text-center mt-10">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">KYC Verified</h2>
        <p className="text-gray-600 mt-2">Your KYC has been approved. You have full access to all services.</p>
      </div>
    );
  }

  if (kycData?.kycStatus === 'pending') {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md text-center mt-10">
        <Info className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">KYC Under Review</h2>
        <p className="text-gray-600 mt-2">Your documents are being reviewed by our team. We will notify you once the process is complete.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Verification</h1>
        <p className="text-gray-600 mb-6">Please provide the following details and documents to verify your account.</p>

        {kycData?.kycStatus === 'rejected' && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-r-lg" role="alert">
            <p className="font-bold flex items-center gap-2"><AlertTriangle size={20} /> KYC Rejected</p>
            <p className="mt-1">Your previous submission was rejected. Reason: <span className="font-semibold">{kycData.details.rejectionReason}</span></p>
            <p className="mt-2 text-sm">Please review the details, upload the correct documents, and re-submit.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal & Outlet Info */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Outlet & Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Outlet Name <span className="text-red-500">*</span></label>
                <input type="text" {...register('outletName', { required: 'Outlet name is required' })} placeholder='Your Shop or Business Name' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.outletName && <p className="text-red-500 text-xs mt-1">{errors.outletName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number <span className="text-red-500">*</span></label>
                <input type="text" {...register('aadhaarNumber', { required: 'Aadhaar number is required', pattern: { value: /^\d{12}$/, message: 'Aadhaar must be 12 digits' } })} placeholder='12-digit Aadhaar Number' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number <span className="text-red-500">*</span></label>
                <input type="text" {...register('panNumber', { required: 'PAN number is required', pattern: { value: /[A-Z]{5}[0-9]{4}[A-Z]{1}/, message: 'Invalid PAN format' } })} placeholder='Permanent Account Number' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase" />
                {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Outlet Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                <input type="text" {...register('state', { required: 'State is required' })} placeholder='e.g., West Bengal' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District <span className="text-red-500">*</span></label>
                <input type="text" {...register('district', { required: 'District is required' })} placeholder='e.g., Kolkata' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Post Office <span className="text-red-500">*</span></label>
                <input type="text" {...register('postOffice', { required: 'Post Office is required' })} placeholder='Your nearest Post Office' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.postOffice && <p className="text-red-500 text-xs mt-1">{errors.postOffice.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code <span className="text-red-500">*</span></label>
                <input type="text" {...register('pinCode', { required: 'PIN Code is required', pattern: { value: /^\d{6}$/, message: 'PIN Code must be 6 digits' } })} placeholder='6-digit PIN Code' className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Address <span className="text-red-500">*</span></label>
                <textarea {...register('address', { required: 'Full address is required' })} placeholder='House No, Street, Landmark...' rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"></textarea>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Live Location (Plus Code) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="text" {...register('plusCode', { required: 'Live location is required' })} readOnly placeholder='Click button to capture ->' className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-100" />
                  <button type="button" onClick={handleGetLocation} disabled={locationLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-semibold disabled:opacity-50">
                    {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />} Capture
                  </button>
                </div>
                {errors.plusCode && <p className="text-red-500 text-xs mt-1">{errors.plusCode.message}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload label="Aadhaar Front Page" name="aadhaarFront" register={register} error={errors.aadhaarFront} watch={watch} setValue={setValue} required={!kycData?.details?.aadhaarFront} existingFileUrl={kycData?.details?.aadhaarFront} />
            <FileUpload label="Aadhaar Back Page" name="aadhaarBack" register={register} error={errors.aadhaarBack} watch={watch} setValue={setValue} required={!kycData?.details?.aadhaarBack} existingFileUrl={kycData?.details?.aadhaarBack} />
            <FileUpload label="PAN Card Image" name="panCardImage" register={register} error={errors.panCardImage} watch={watch} setValue={setValue} required={!kycData?.details?.panCardImage} existingFileUrl={kycData?.details?.panCardImage} />
            <FileUpload label="Your Photo" name="photo" register={register} error={errors.photo} watch={watch} setValue={setValue} required={!kycData?.details?.photo} existingFileUrl={kycData?.details?.photo} />
            <FileUpload label="Bank Cheque / Passbook (Optional)" name="bankDocument" register={register} error={errors.bankDocument} watch={watch} setValue={setValue} required={false} existingFileUrl={kycData?.details?.bankDocument} />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KycPage;