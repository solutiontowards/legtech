import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Search, FileSearch, Download, Loader2, Info } from 'lucide-react';
import { findDocument, processDownloadPayment } from '../../api/retailer';
import { useAuth } from '../../context/AuthContext';

const FindDocuments = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const onSearch = async ({ applicationNumber }) => {
    setIsLoading(true);
    setSubmission(null);
    try {
      const { data } = await findDocument(applicationNumber);
      if (data.ok) {
        setSubmission(data.submission);
        Swal.fire({
          title: 'Document Found!',
          text: 'The final document for your application is ready.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Not Found',
        text: error.response?.data?.message || 'Could not find the document. Please check the application number.',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!submission) return;

    // If already paid, download directly
    if (submission.isFinalDocumentDownloaded) {
      window.open(submission.finalDocument, '_blank');
      return;
    }

    // If not paid, show payment confirmation
    const result = await Swal.fire({
      title: 'Confirm Download',
      html: "A one-time fee of <b>₹1.00</b> will be deducted from your wallet to download this document.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Pay & Download',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await processDownloadPayment(submission._id);
        await refreshUser(); // Refresh user context to get updated wallet balance
        Swal.fire({
          title: 'Payment Successful!',
          text: 'Your document is now downloading.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        // Open the document in a new tab
        window.open(submission.finalDocument, '_blank');
        // Update local state to reflect payment
        setSubmission(prev => ({ ...prev, isFinalDocumentDownloaded: true }));
      } catch (error) {
        Swal.fire({
          title: 'Payment Failed',
          text: error.response?.data?.message || 'An error occurred during payment.',
          icon: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <FileSearch className="mx-auto h-16 w-16 text-blue-600" />
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight">Find Your Document</h1>
          <p className="mt-2 text-lg text-gray-600">Enter your application number to retrieve your final document.</p>
        </div>

        <form onSubmit={handleSubmit(onSearch)} className="flex items-start gap-3 mb-10">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register('applicationNumber', { required: 'Application number is required' })}
              type="text"
              placeholder="Enter Application Number (e.g., SRI12345678)"
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${errors.applicationNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
            />
          </div>
          <button type="submit" disabled={isLoading} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Find'}
          </button>
        </form>

        {errors.applicationNumber && <p className="text-center text-red-600 -mt-6 mb-6">{errors.applicationNumber.message}</p>}

        {submission && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Document Ready</h2>
            <div className="mt-6 space-y-4 border-t border-b border-gray-200 py-6">
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Application No:</span><span className="font-bold text-gray-900 font-mono">{submission.applicationNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Service Name:</span><span className="font-bold text-gray-900">{submission.serviceId.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Status:</span><span className="font-bold text-green-600">Completed</span></div>
            </div>
            <div className="mt-6">
              <button onClick={handleDownload} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:bg-green-400">
                {isLoading ? <Loader2 className="animate-spin" /> : <Download />}
                {submission.isFinalDocumentDownloaded ? 'Download Again' : 'Pay ₹1 & Download'}
              </button>
              {!submission.isFinalDocumentDownloaded && <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1.5"><Info size={14}/> A one-time fee of ₹1 will be charged for the first download.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDocuments;