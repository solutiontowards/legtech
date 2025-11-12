import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadSingle } from "../../../api/upload";
import { createOption, updateOption, getOptionBySlug, } from "../../../api/admin";
import { listServices } from "../../../api/services";
import toast from "react-hot-toast";
import {
  UploadCloud, Image as ImageIcon, Type, Loader2, ChevronLeft, Save, List, DollarSign, Link as LinkIcon, PlusCircle, Trash2, ToggleLeft, ToggleRight, FileText, AlertCircle,
} from "lucide-react";

const AddSubServicesOption = () => {
  const { serviceSlug, subServiceSlug, optionSlug } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(optionSlug);

  const [loading, setLoading] = useState(false);
  const [optionId, setOptionId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [formErrors, setFormErrors] = useState([]);

  const [option, setOption] = useState({
    subServiceId: "",
    name: "",
    slug: "",
    price: 0,
    image: null,
    isExternal: false,
    externalLink: "",
    formFields: [],
  });

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const { data: servicesData } = await listServices();
        setServices(servicesData?.services || []);

        if (isEditMode) {
          const { data: optionData } = await getOptionBySlug(serviceSlug, subServiceSlug, optionSlug);
          const fetchedOption = optionData.option;

          // Find parent service to populate dropdowns correctly
          const parentSubService = servicesData?.services
            .flatMap(s => s.subServices)
            .find(ss => ss._id === fetchedOption.subServiceId);
          const parentService = servicesData?.services.find(s => s._id === parentSubService?.serviceId);

          if (parentService) {
            setSelectedService(parentService._id);
            setSubServices(parentService.subServices);
          }

          setOption({
            subServiceId: fetchedOption.subServiceId,
            name: fetchedOption.name,
            slug: fetchedOption.slug,
            price: fetchedOption.price,
            image: fetchedOption.image,
            isExternal: fetchedOption.isExternal,
            externalLink: fetchedOption.externalLink,
            formFields: fetchedOption.formFields || [],
          });
          setOptionId(fetchedOption._id);
          setPreview(fetchedOption.image);
        }
      } catch (error) {
        toast.error("Failed to fetch initial data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [isEditMode, serviceSlug, subServiceSlug, optionSlug]);

  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s._id === selectedService);
      setSubServices(service?.subServices || []);
      // Don't reset subServiceId if it's already set in edit mode
      if (!isEditMode) {
        setOption(prev => ({ ...prev, subServiceId: "" }));
      }
    } else {
      setSubServices([]);
    }
  }, [selectedService, services, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setOption(prev => ({ ...prev, [name]: val }));
    if (name === 'name') {
      const slug = value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      setOption(prev => ({ ...prev, slug }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOption({ ...option, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const addFormField = () => {
    setOption(prev => ({
      ...prev,
      formFields: [...prev.formFields, { label: "", name: "", type: "text", placeholder: "", required: false }]
    }));
  };

  const removeFormField = (index) => {
    setOption(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, i) => i !== index)
    }));
  };

  const handleFormFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const updatedFields = [...option.formFields];
    updatedFields[index][name] = val;

    if (name === 'label') {
      // Set the 'name' field to be an exact copy of the 'label'
      updatedFields[index]['name'] = value;
    }

    setOption(prev => ({ ...prev, formFields: updatedFields }));
  };

  const validateFormFields = () => {
    const errors = [];
    let isValid = true;
    option.formFields.forEach((field, index) => {
      const fieldErrors = {};
      if (!field.label.trim()) {
        fieldErrors.label = "Label is required.";
        isValid = false;
      }
      if (
        ["text", "number", "email", "textarea"].includes(field.type) &&
        !field.placeholder.trim()
      ) {
        fieldErrors.placeholder = "Placeholder is required.";
        isValid = false;
      }
      errors[index] = fieldErrors;
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!option.subServiceId || !option.name) {
      return toast.error("Please select a sub-service and provide a name for the option.");
    }
    if (!validateFormFields()) {
      return toast.error("Please fill all required custom form fields.");
    }
    setLoading(true);
    try {
      let imageUrl = option.image;
      if (option.image instanceof File) {
        const { data: uploadRes } = await uploadSingle(option.image);
        imageUrl = uploadRes.url;
      }

      const payload = { ...option, image: imageUrl };

      if (isEditMode) {
        await updateOption(optionId, payload);
        toast.success("Option updated successfully!");
      } else {
        await createOption(payload);
        toast.success("Option created successfully!");
      }
      navigate("/st-admin/subservice-option");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} option.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {isEditMode ? "Edit Service Option" : "Add New Service Option"}
            </h1>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Details */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><List size={18} /> Parent Service</label>
                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                  <option value="">Select Service</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><List size={18} /> Parent Sub-Service</label>
                <select name="subServiceId" value={option.subServiceId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" disabled={!selectedService}>
                  <option value="">Select Sub-Service</option>
                  {subServices.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><Type size={18} /> Option Name</label>
              <input type="text" name="name" value={option.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., Basic Plan" />
            </div>

            <div>
              <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><DollarSign size={18} /> Price</label>
              <input type="number" name="price" value={option.price} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="0.00" />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <input type="checkbox" id="isExternal" name="isExternal" checked={option.isExternal} onChange={handleInputChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
              <label htmlFor="isExternal" className="text-gray-700 font-medium flex items-center gap-2 cursor-pointer">
                {option.isExternal ? <ToggleRight size={22} className="text-blue-600" /> : <ToggleLeft size={22} />} Is this an External Link?
              </label>
            </div>

            {option.isExternal && (
              <div>
                <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><LinkIcon size={18} /> External URL</label>
                <input type="text" name="externalLink" value={option.externalLink} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="https://example.com" />
              </div>
            )}
          </div>

          {/* Right Column: Image Upload */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><ImageIcon size={18} /> Option Image</label>
            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition group" onClick={() => document.getElementById('imageUpload').click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition" />
                  <p className="mt-2 text-sm">Click to upload image</p>
                </div>
              )}
              <input id="imageUpload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>
          </div>
        </div>

        {/* Custom Form Fields Section */}
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-3 sm:mb-0"><FileText /> Custom Form Fields</h2>
            <button onClick={addFormField} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">
              <PlusCircle size={18} /> Add New Field
            </button>
          </div>
          <div className="space-y-6">
            {option.formFields.map((field, index) => {
              const errors = formErrors[index] || {};
              return (
                <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Field Type */}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Field Type</label>
                      <select name="type" value={field.type} onChange={e => handleFormFieldChange(index, e)} className="p-2.5 border border-gray-300 rounded-md w-full mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        <option value="text">Text</option> <option value="number">Number</option> <option value="email">Email</option> <option value="date">Date</option> <option value="file">File</option> <option value="textarea">Text Area</option>
                      </select>
                    </div>
                    {/* Field Label */}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Field Label</label>
                      <input type="text" name="label" value={field.label} onChange={e => handleFormFieldChange(index, e)} placeholder="e.g., Full Name" className={`p-2.5 border rounded-md w-full mt-1 focus:ring-2 focus:border-blue-500 transition ${errors.label ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.label && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.label}</p>}
                    </div>
                    {/* Placeholder */}
                    {['text', 'number', 'email', 'textarea'].includes(field.type) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Placeholder</label>
                        <input type="text" name="placeholder" value={field.placeholder} onChange={e => handleFormFieldChange(index, e)} placeholder="e.g., Enter your full name" className={`p-2.5 border rounded-md w-full mt-1 focus:ring-2 focus:border-blue-500 transition ${errors.placeholder ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.placeholder && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.placeholder}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" name="required" checked={field.required} onChange={e => handleFormFieldChange(index, e)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Required</label>
                    <button onClick={() => removeFormField(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <input type="hidden" name="name" value={field.name} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="mt-8 flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className={`px-6 sm:px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"}`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="hidden sm:inline">{loading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Option")}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddSubServicesOption