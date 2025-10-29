import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadSingle } from "../../../api/upload";
import { createOption, updateOption, getOptionBySlug } from "../../../api/admin";
import { listServices } from "../../../api/services";
import toast from "react-hot-toast";
import {
  UploadCloud, Image as ImageIcon, Type, Loader2, ChevronLeft, Save, List, DollarSign, Link as LinkIcon, PlusCircle, Trash2, ToggleLeft, ToggleRight, FileText
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
    const updatedFields = [...option.formFields];
    updatedFields[index][name] = type === 'checkbox' ? checked : value;
    setOption(prev => ({ ...prev, formFields: updatedFields }));
  };

  const handleSubmit = async () => {
    if (!option.subServiceId || !option.name) {
      return toast.error("Please select a sub-service and provide a name for the option.");
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
      navigate("/admin/subservice-option");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} option.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 mr-4"><ChevronLeft size={24} /></button>
          <h1 className="text-3xl font-bold text-gray-800">{isEditMode ? "Edit Option" : "Add New Option"}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1"><List size={18} /> Parent Service</label>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Select Service</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-1"><List size={18} /> Parent Sub-Service</label>
            <select name="subServiceId" value={option.subServiceId} onChange={handleInputChange} className="w-full p-3 border rounded-lg" disabled={!selectedService}>
              <option value="">Select Sub-Service</option>
              {subServices.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2"><label className="text-gray-700 font-medium flex items-center gap-2 mb-1"><Type size={18} /> Option Name</label><input type="text" name="name" value={option.name} onChange={handleInputChange} className="w-full p-3 border rounded-lg" placeholder="e.g., Basic Plan" /></div>
          <div><label className="text-gray-700 font-medium flex items-center gap-2 mb-1"><DollarSign size={18} /> Price</label><input type="number" name="price" value={option.price} onChange={handleInputChange} className="w-full p-3 border rounded-lg" placeholder="0.00" /></div>
          
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2 mb-2"><ImageIcon size={18} /> Option Image</label>
            <div className="relative w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" /> : <div className="text-center"><UploadCloud className="mx-auto h-10 w-10 text-gray-400" /><p className="text-xs text-gray-500">Upload</p></div>}
              <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-4">
            <label className="text-gray-700 font-medium flex items-center gap-2">
              {option.isExternal ? <ToggleRight size={20} className="text-blue-600"/> : <ToggleLeft size={20} />} Is External Link?
            </label>
            <input type="checkbox" name="isExternal" checked={option.isExternal} onChange={handleInputChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
          </div>
          {option.isExternal && <div className="md:col-span-2"><label className="text-gray-700 font-medium flex items-center gap-2 mb-1"><LinkIcon size={18} /> External URL</label><input type="text" name="externalLink" value={option.externalLink} onChange={handleInputChange} className="w-full p-3 border rounded-lg" placeholder="https://example.com" /></div>}
        </div>

        <div className="mt-10 pt-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText /> Custom Form Fields</h2>
            <button onClick={addFormField} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"><PlusCircle size={16} /> Add Field</button>
          </div>
          <div className="space-y-4">
            {option.formFields.map((field, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <input type="text" name="label" value={field.label} onChange={e => handleFormFieldChange(index, e)} placeholder="Field Label (e.g., Full Name)" className="p-2 border rounded-md w-full" />
                <input type="text" name="name" value={field.name} onChange={e => handleFormFieldChange(index, e)} placeholder="Field Name (e.g., fullName)" className="p-2 border rounded-md w-full" />
                <select name="type" value={field.type} onChange={e => handleFormFieldChange(index, e)} className="p-2 border rounded-md w-full">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="file">File</option>
                  <option value="textarea">Text Area</option>
                </select>
                <input type="text" name="placeholder" value={field.placeholder} onChange={e => handleFormFieldChange(index, e)} placeholder="Placeholder Text" className="p-2 border rounded-md w-full" />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" checked={field.required} onChange={e => handleFormFieldChange(index, e)} className="h-4 w-4 rounded" /> Required</label>
                  <button onClick={() => removeFormField(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button onClick={handleSubmit} disabled={loading} className={`px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Option")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddSubServicesOption