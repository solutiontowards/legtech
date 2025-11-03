import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { getAllNotices, createNotice, updateNotice, deleteNotice } from "../../api/notice";
import { Loader2, Plus, Edit, Trash2, X, Megaphone, AlertCircle, CheckCircle, Info } from "lucide-react";
import Swal from "sweetalert2";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await getAllNotices();
      setNotices(data.notices || []);
    } catch (error) {
      toast.error("Failed to fetch notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleEditClick = (notice) => {
    setEditingNotice(notice);
    setValue("text", notice.text);
  };

  const cancelEdit = () => {
    setEditingNotice(null);
    reset();
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    const payload = { text: formData.text };

    try {
      if (editingNotice) {
        await updateNotice(editingNotice._id, payload);
        toast.success("Notice updated successfully!");
      } else {
        await createNotice(payload);
        toast.success("Notice created successfully!");
      }
      reset();
      setEditingNotice(null);
      fetchNotices();
    } catch (error) {
      toast.error(editingNotice ? "Failed to update notice." : "Failed to create notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (notice) => {
    try {
      await updateNotice(notice._id, { isActive: !notice.isActive });
      toast.success(`Notice ${!notice.isActive ? "activated" : "deactivated"}.`);
      fetchNotices();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteNotice(id);
        toast.success("Notice deleted successfully.");
        fetchNotices();
      } catch (error) {
        toast.error("Failed to delete notice.");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage notices for retailers.</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Total Notices: <span className="font-bold text-blue-600">{notices.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{editingNotice ? "Edit Announcement" : "New Announcement"}</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="notice-text" className="sr-only">Notice Text</label>
                <textarea
                  id="notice-text"
                  {...register("text", { required: "Notice text cannot be empty." })}
                  rows="4"
                  className={`w-full p-3 border-2 rounded-lg transition-all focus:ring-2 ${errors.text ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                  placeholder="Enter notice text here..."
                ></textarea>
                {errors.text && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.text.message}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md hover:shadow-lg">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  <span>{editingNotice ? "Update Notice" : "Add Notice"}</span>
                </button>
                {editingNotice && (
                  <button type="button" onClick={cancelEdit} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Announcements</h2>
            {loading ? (
              <div className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>
            ) : notices.length > 0 ? (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 transition-all hover:border-blue-200 hover:bg-blue-50/50">
                    <div className="flex-1">
                      <p className={`text-gray-800 ${!notice.isActive && "text-gray-400 italic"}`}>{notice.text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        By {notice.createdBy?.name || 'Admin'} on {format(new Date(notice.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                      <span onClick={() => toggleStatus(notice)} className={`cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${notice.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {notice.isActive ? <CheckCircle size={14} /> : <Info size={14} />}
                        {notice.isActive ? "Active" : "Inactive"}
                      </span>
                      <button onClick={() => handleEditClick(notice)} className="p-2 hover:bg-blue-100 rounded-full text-blue-600" title="Edit Notice">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(notice._id)} className="p-2 hover:bg-red-100 rounded-full text-red-600" title="Delete Notice">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-xl">
                <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Announcements</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new announcement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
           