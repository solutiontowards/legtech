import React, { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";

export const FileUpload = ({
  name,
  label,
  register,
  error,
  watch,
  setValue,
  required = true,
  existingFileUrl,
}) => {
  const newFile = watch(name)?.[0];
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (newFile) {
      if (newFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(newFile);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      }
      setPreview("file_object");
    } else if (existingFileUrl) {
      setPreview(existingFileUrl);
    } else {
      setPreview(null);
    }
  }, [newFile, existingFileUrl]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* 👉 DEFAULT HTML file input (NO custom UI) */}
      <input
        type="file"
        accept="image/*,application/pdf"
        {...register(name, {
          required: required ? `${label} is required.` : false,
        })}
        className="block text-sm text-gray-700"
      />

      {/* Preview Box */}
      {preview && (
        <div className="mt-3 border p-3 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {preview.startsWith("http") || preview.startsWith("blob:") ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-14 w-14 object-cover rounded-md border"
                />
              ) : (
                <div className="h-14 w-14 flex items-center justify-center bg-gray-200 rounded-md">
                  <FileText className="text-gray-500" />
                </div>
              )}

              <p className="text-sm text-gray-700 truncate">
                {newFile?.name || "Previously uploaded file"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setValue(name, null);
                setPreview(null);
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
