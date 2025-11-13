import React from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export const FileUpload = ({ name, label, register, error, watch, setValue, required = true }) => {
  const file = watch(name);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {file?.[0] ? (
        <div className="flex items-center justify-between p-2 bg-gray-100 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-800 truncate">{file[0].name}</span>
          </div>
          <button type="button" onClick={() => setValue(name, null)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <label htmlFor={name} className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
            Click to upload
          </label>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
          <input
            id={name}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...register(name, { required: required ? `${label} is required.` : false })}
          />
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};