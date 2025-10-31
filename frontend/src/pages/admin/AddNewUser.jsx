import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { createUser } from '../../api/admin';
import { Loader2, User, Mail, Phone, Lock, ShieldCheck, AlertCircle, UserPlus, ChevronDown } from 'lucide-react';
 
const AddNewUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'retailer', // Default role
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for mobile to allow only 10 digits
    if (name === 'mobile') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    if (!formData.role) newErrors.role = 'Please select a user role.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to create a new ${formData.role}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a', // green-600
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, create user!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const response = await createUser(formData);
          Swal.fire({
            icon: 'success',
            title: 'User Created!',
            text: response.data.message,
            timer: 2000,
            showConfirmButton: false,
          });
          // Reset form
          setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
            role: 'retailer',
          });
          setErrors({});
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'An error occurred while creating the user.';
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Create New User</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to add a new user to the system.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} icon={<User />} placeholder="e.g., John Doe" />
            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} icon={<Mail />} placeholder="e.g., john.doe@example.com" />
            <InputField label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} error={errors.mobile} icon={<Phone />} placeholder="10-digit mobile number" />
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} icon={<Lock />} placeholder="Min. 6 characters" />
            <SelectField label="User Role" name="role" value={formData.role} onChange={handleChange} error={errors.role} icon={<ShieldCheck />} options={[{ value: 'retailer', label: 'Retailer' }, { value: 'admin', label: 'Admin' }]} />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = 'text', value, onChange, error, icon, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
      </span>
      <input
        type={type} name={name} id={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
      />
      {error && <AlertCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-full w-8 text-red-500" />}
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, icon, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
      </span>
      <select
        name={name} id={name} value={value} onChange={onChange}
        className={`block w-full appearance-none pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400"><ChevronDown className="h-5 w-5" /></span>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

export default AddNewUser;