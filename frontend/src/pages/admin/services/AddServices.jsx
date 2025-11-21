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
  Loader2,
  ChevronLeft,
  Save,
  Plus,
  X,
} from "lucide-react";

const AddServices = () => {
  const { slug: slugParam } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(slugParam);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [svc, setSvc] = useState({
    name: "",
    slug: "",
    image: null,
  });
  // New state for managing the list of required documents
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState("");

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
            image: serviceData.image, // This is the URL
          });
          setDocuments(serviceData.requiredDocuments || []);
          setPreview(serviceData.image);
        } catch (error) {
          toast.error("Failed to fetch service details.");
          navigate("/st-admin/services");
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

  // Handlers for the new document list UI
  const handleAddDocument = () => {
    if (currentDoc && !documents.includes(currentDoc)) {
      setDocuments([...documents, currentDoc.trim()]);
      setCurrentDoc("");
    } else if (documents.includes(currentDoc)) {
      toast.error("This document is already in the list.");
    }
  };

  const handleRemoveDocument = (docToRemove) => {
    setDocuments(documents.filter(doc => doc !== docToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDocument();
    }
  };

  const handleSubmit = async () => {
    if (!svc.name || !svc.image) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in the service name and choose an image.",
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
        image: imageUrl,
        requiredDocuments: documents,
      };

      if (isEditMode) {
        await updateService(svc._id, payload);
        Swal.fire({
          icon: "success",
          title: "Service Updated",
          text: "The service has been updated successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/st-admin/services");
        });
      } else {
        await createService(payload);
        Swal.fire({
          icon: "success",
          title: "Service Created",
          text: "The new service has been added successfully!",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          navigate("/st-admin/services");
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
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-2">
              <FileText size={18} /> Required Documents
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentDoc}
                onChange={(e) => setCurrentDoc(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Aadhaar Card, PAN Card"
              />
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold flex-shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium text-gray-800">
                  <span>{doc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc)}
                    className="p-0.5 rounded-full hover:bg-red-200 text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
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