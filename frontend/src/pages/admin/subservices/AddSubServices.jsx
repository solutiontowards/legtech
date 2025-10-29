import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadSingle } from "../../../api/upload";
import { createSubService, updateSubService, getSubServiceBySlug } from "../../../api/admin";
import { listServices } from "../../../api/services"; // To get parent services
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  UploadCloud,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Loader2,
  ChevronLeft,
  Save,
  List,
} from "lucide-react";

const AddSubServices = () => {
  const { serviceSlug, subServiceSlug } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(serviceSlug && subServiceSlug);
  const [loading, setLoading] = useState(false);
  const [subServiceId, setSubServiceId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subSvc, setSubSvc] = useState({
    serviceId: "", // Parent service ID
    name: "",
    slug: "",
    description: "",
    image: null,
  });
  const [services, setServices] = useState([]); // List of parent services

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        // Fetch all services for the dropdown
        const { data: servicesData } = await listServices();
        setServices(servicesData?.services || []);

        if (isEditMode) {
          // Fetch sub-service details for editing
          const { data } = await getSubServiceBySlug(serviceSlug, subServiceSlug);
          const subServiceData = data.subService;
          setSubSvc({
            serviceId: subServiceData.serviceId,
            name: subServiceData.name,
            slug: subServiceData.slug,
            description: subServiceData.description,
            image: subServiceData.image, // This is the URL
          });
          setSubServiceId(subServiceData._id);
          setPreview(subServiceData.image);
        }
      } catch (error) {
        toast.error("Failed to fetch data.");
        console.error("Error fetching data:", error);
        if (isEditMode) navigate("/admin/subservices");
      } finally {
        setLoading(false);
      }
    }
    AOS.init({ duration: 600, once: true });
    fetchInitialData();
  }, [isEditMode, serviceSlug, subServiceSlug, navigate]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSubSvc({ ...subSvc, name: value, slug });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubSvc({ ...subSvc, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!subSvc.serviceId || !subSvc.name || !subSvc.description || !subSvc.image) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a parent service, fill name, description, and choose an image.",
      });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = preview; // Keep existing image if not changed

      // If a new image file was selected (not just a URL string)
      if (subSvc.image instanceof File) {
        const { data: uploadRes } = await uploadSingle(subSvc.image);
        imageUrl = uploadRes.url;
      }

      const payload = {
        serviceId: subSvc.serviceId,
        name: subSvc.name,
        slug: subSvc.slug,
        description: subSvc.description,
        image: imageUrl,
      };

      if (isEditMode) {
        await updateSubService(subServiceId, payload);
        Swal.fire({
          icon: "success",
          title: "Sub-Service Updated",
          text: "The sub-service has been updated successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/admin/subservices");
        });
      } else {
        await createSubService(payload);
        Swal.fire({
          icon: "success",
          title: "Sub-Service Created",
          text: "The new sub-service has been added successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/admin/subservices");
        });
      }
    } catch (error) {
      console.error(error);
      const action = isEditMode ? "updating" : "creating";
      Swal.fire({
        icon: "error",
        title: `${isEditMode ? 'Update' : 'Creation'} Failed`,
        text: `Something went wrong while ${action} the sub-service.`,
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
            {isEditMode ? "Edit Sub-Service" : "Add New Sub-Service"}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="serviceId" className="text-gray-700 font-medium flex items-center gap-2 mb-1">
              <List size={18} /> Parent Service
            </label>
            <select
              id="serviceId"
              value={subSvc.serviceId}
              onChange={(e) => setSubSvc({ ...subSvc, serviceId: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select a Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1">
              <Type size={18} /> Sub-Service Name
            </label>
            <input
              type="text"
              value={subSvc.name}
              onChange={handleNameChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter sub-service name"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1">
              <AlignLeft size={18} /> Description
            </label>
            <textarea
              rows="4"
              value={subSvc.description}
              onChange={(e) => setSubSvc({ ...subSvc, description: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter a detailed description for the sub-service"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-2">
              <ImageIcon size={18} /> Sub-Service Image
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
              {loading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Sub-Service")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSubServices