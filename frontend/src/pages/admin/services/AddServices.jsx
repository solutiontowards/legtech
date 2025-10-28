import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadSingle } from "../../../api/upload";
import { createService, updateService, getServiceBySlug } from "../../../api/admin";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Type,
  AlignLeft,
  Loader2,
  ChevronLeft,
  Save,
} from "lucide-react";

const AddServices = () => {
  const { slug: slugParam } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(slugParam);
  const [loading, setLoading] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [svc, setSvc] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    async function fetchServiceData() {
      if (isEditMode) {
        try {
          setLoading(true);
          const { data } = await getServiceBySlug(slugParam);
          const serviceData = data.service;
          setSvc({
            _id: serviceData._id,
            name: serviceData.name,
            slug: serviceData.slug,
            description: serviceData.description,
            image: serviceData.image, // This is the URL
          });
          setPreview(serviceData.image);
        } catch (error) {
          toast.error("Failed to fetch service details.");
          navigate("/admin/services");
        } finally {
          setLoading(false);
        }
      }
    }
    AOS.init({ duration: 600, once: true });
    fetchServiceData();
  }, [isEditMode, slugParam, navigate]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSvc({ ...svc, name: value, slug });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSvc({ ...svc, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!svc.name || !svc.description || !svc.image) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill name, description and choose an image.",
      });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = preview; // Keep existing image if not changed

      // If a new image file was selected (not just a URL string)
      if (svc.image instanceof File) {
        const { data: uploadRes } = await uploadSingle(svc.image);
        imageUrl = uploadRes.url;
      }

      const payload = {
        name: svc.name,
        slug: svc.slug,
        description: svc.description,
        image: imageUrl,
      };

      if (isEditMode) {
        await updateService(svc._id, payload);
        Swal.fire({
          icon: "success",
          title: "Service Updated",
          text: "The service has been updated successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/admin/services");
        });
      } else {
        await createService(payload);
        Swal.fire({
          icon: "success",
          title: "Service Created",
          text: "The new service has been added successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/admin/services");
        });
      }
    } catch (error) {
      console.error(error);
      const action = isEditMode ? "updating" : "creating";
      Swal.fire({
        icon: "error",
        title: `${isEditMode ? 'Update' : 'Creation'} Failed`,
        text: `Something went wrong while ${action} the service.`,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen" data-aos="fade-up">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 mr-4"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Service" : "Add New Service"}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1">
              <Type size={18} /> Service Name
            </label>
            <input
              type="text"
              value={svc.name}
              onChange={handleNameChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter service name"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1">
              <AlignLeft size={18} /> Description
            </label>
            <textarea
              rows="4"
              value={svc.description}
              onChange={(e) => setSvc({ ...svc, description: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter a detailed description for the service"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-2">
              <ImageIcon size={18} /> Service Image
            </label>
            <div className="mt-1 flex items-center gap-6">
              <div className="relative w-40 h-40 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-xs text-gray-500">Click to upload</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditMode ? <Save size={20} /> : <UploadCloud size={20} />)}
              {loading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Service")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServices;