import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function AdminLogin() {
    const [form, setForm] = useState({ mobile: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('credentials'); // 'credentials' | 'verify'
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(30); // Changed from refreshAuth to refreshUser to match context
    const { user, loading: authLoading, refreshUser, setUser } = useAuth();
    const navigate = useNavigate();




    useEffect(() => {
        let timer;
        if (step === 'verify' && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, resendTimer]);

    const validateCredentials = () => {
        const newErrors = {};
        if (!form.mobile) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Mobile number must be exactly 10 digits';
        if (!form.password) newErrors.password = 'Password is required';
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateOtp = () => {
        if (!otp) return 'OTP is required';
        if (!/^\d{6}$/.test(otp)) return 'OTP must be exactly 6 digits';
        return '';
    };

    const handleMobileChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setForm({ ...form, mobile: value });
        setErrors({ ...errors, mobile: '' });
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
        setErrors({ ...errors, otp: '' });
    };

    async function sendOtp() {
        if (!validateCredentials()) return;

        setLoading(true);
        Swal.fire({
            title: 'Sending OTP...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await api.post('/auth/adminlogin', { mobile: form.mobile, password: form.password });
            Swal.fire({
                icon: 'success',
                title: 'OTP Sent',
                text: 'OTP sent successfully via WhatsApp.',
                timer: 2000,
                showConfirmButton: false,
            });
            setStep('verify');
            setResendTimer(30);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to send OTP. Please check your credentials.',
            });
        } finally {
            setLoading(false);
        }
    }

    async function verifyOtp() {
        const otpError = validateOtp();
        if (otpError) {
            setErrors({ otp: otpError });
            return;
        }

        setLoading(true);
        Swal.fire({
            title: 'Verifying OTP...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await api.post('/auth/verify-adminlogin-otp', {
                mobile: form.mobile,
                code: otp,
            });
            // This is the fix: wait for the auth context to update with the new user info,
            // then manually set the user to ensure the context is updated before navigation.
            const loggedInUser = await refreshUser();
            if (loggedInUser) setUser(loggedInUser);

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: response.data.message || 'You are now logged in as Admin.',
                timer: 2000,
                showConfirmButton: false,
            });
            // Now that the auth state is updated, we can safely navigate.
            navigate('/admin/dashboard')
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Invalid OTP. Please try again.',
            });
            setErrors({ ...errors, otp: err.response?.data?.error || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    }

    async function resendOtp() {
        if (!validateCredentials()) return;

        setLoading(true);
        Swal.fire({
            title: 'Resending OTP...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await api.post('/auth/resend-otp', { mobile: form.mobile, purpose: 'login' });
            Swal.fire({
                icon: 'success',
                title: 'OTP Resent',
                text: 'OTP resent successfully via WhatsApp.',
                timer: 2000,
                showConfirmButton: false,
            });
            setResendTimer(30);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to resend OTP. Please check your credentials.',
            });
        } finally {
            setLoading(false);
        }
    }

    // Show a loading spinner while checking auth status to prevent form flash
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
        );
    }

    return (
        <div className="flex min-h-screen py-5 items-center justify-center bg-gray-50">
            <div className="flex md:flex-row flex-col-reverse w-full max-w-6xl rounded-2xl shadow-2xl bg-white overflow-hidden">
                {/* Left Side: Form */}
                <div className="md:w-1/2 w-full p-10 flex flex-col justify-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Admin Login</h2>

                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <div className="flex items-center gap-4">
                                <input
                                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'credentials' ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    placeholder="Enter 10-digit mobile number"
                                    value={form.mobile}
                                    onChange={handleMobileChange}
                                    maxLength={10}
                                    disabled={step !== 'credentials'}
                                />
                            </div>
                            {errors.mobile && <p className="text-red-500 text-sm mt-2">{errors.mobile}</p>}
                            {step === 'verify' && (
                                <p className="text-green-500 text-sm mt-2 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" /> OTP sent successfully
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 cursor-not-allowed"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => {
                                    setForm({ ...form, password: e.target.value });
                                    setErrors({ ...errors, password: '' });
                                }}
                                disabled={step !== 'credentials'}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-8"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                        </div>

                        {step === 'verify' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        maxLength={6}
                                    />
                                    {errors.otp && <p className="text-red-500 text-sm mt-2">{errors.otp}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <button
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                                        onClick={verifyOtp}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : 'Verify OTP'}
                                    </button>
                                    <button
                                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                        onClick={resendOtp}
                                        disabled={loading || resendTimer > 0}
                                    >
                                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 'credentials' && (
                            <button
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 whitespace-nowrap"
                                onClick={sendOtp}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : 'Login'}
                            </button>
                        )}


                    </div>
                </div>

                {/* Right Side: Image Slider */}
                <div className="md:w-1/2 w-full">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000 }}
                        loop={true}
                        className="h-full"
                    >
                        <SwiperSlide>
                            <img
                                src="/register-banner1.avif"
                                alt="Admin Services 1"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                src="/register-banner2.avif"
                                alt="Admin Services 2"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                src="/register-banner3.avif"
                                alt="Admin Services 3"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </div>
    );
}