import React, { useState, useEffect } from "react";
import {
  getAllWishes,
  createWish,
  updateWish,
  deleteWish,
} from "../../api/admin";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  MessageSquare,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";

const RetailerWishes = () => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveWish, setHasActiveWish] = useState(false);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const res = await getAllWishes();
      const allWishes = res.data.wishes || [];
      setWishes(allWishes);
      setHasActiveWish(allWishes.some((w) => w.isActive));
    } catch (error) {
      Swal.fire("Error", "Failed to fetch messages.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleCreateWish = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      return Swal.fire("Warning", "Message cannot be empty.", "warning");
    }
    setIsSubmitting(true);
    try {
      await createWish({ message: newMessage });
      Swal.fire("Success", "New message created successfully!", "success");
      setNewMessage("");
      fetchWishes();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to create message.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (wish) => {
    try {
      await updateWish(wish._id, { isActive: !wish.isActive });
      Swal.fire(
        "Updated",
        `Message has been ${!wish.isActive ? "activated" : "deactivated"}.`,
        "success"
      );
      fetchWishes();
    } catch (error) {
      Swal.fire("Error", "Failed to update message status.", "error");
    }
  };

  const handleUpdateMessage = async (wish) => {
    const { value: text } = await Swal.fire({
      title: "Update Message",
      input: "textarea",
      inputValue: wish.message,
      inputPlaceholder: "Enter the new message here...",
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#6B7280",
    });

    if (text && text.trim() !== wish.message) {
      try {
        await updateWish(wish._id, { message: text });
        Swal.fire("Success", "Message updated successfully!", "success");
        fetchWishes();
      } catch (error) {
        Swal.fire("Error", "Failed to update message.", "error");
      }
    }
  };

  const handleDeleteWish = (wishId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteWish(wishId);
          Swal.fire("Deleted!", "Message deleted successfully.", "success");
          setWishes((prev) => prev.filter((w) => w._id !== wishId));
        } catch (error) {
          Swal.fire("Error", "Failed to delete message.", "error");
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Manage Global Retailer Messages
        </h1>

        {/* Form Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 transition-all hover:shadow-lg">
          {hasActiveWish ? (
            <div className="flex items-center gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <Info className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Creation Disabled
                </h3>
                <p className="text-sm text-yellow-700">
                  An active message already exists. Please deactivate it before
                  creating a new one.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateWish}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" /> Create New Message
              </h2>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter a message that will be shown to all retailers..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[100px]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full md:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Add Message"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Wishes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
            </div>
          ) : wishes.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No messages found. Add one above to get started.
            </p>
          ) : (
            wishes.map((wish) => (
              <div
                key={wish._id}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      wish.isActive ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <MessageSquare
                      className={`w-5 h-5 ${
                        wish.isActive ? "text-green-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{wish.message}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                        wish.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {wish.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wish.isActive}
                      onChange={() => handleToggleStatus(wish)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>

                  {/* Edit */}
                  <button
                    onClick={() => handleUpdateMessage(wish)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteWish(wish._id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RetailerWishes;
