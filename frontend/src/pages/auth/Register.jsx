import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('send'); // 'send' | 'verify' | 'details'
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
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

    const validateMobile = () => {
        if (!form.mobile) return 'Mobile number is required';
        if (!/^\d{10}$/.test(form.mobile)) return 'Mobile number must be exactly 10 digits';
        return '';
    };

    const validateOtp = () => {
        if (!otp) return 'OTP is required';
        if (!/^\d{6}$/.test(otp)) return 'OTP must be exactly 6 digits';
        return '';
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = 'Name is required';
        if (!form.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
        if (!form.password) newErrors.password = 'Password is required';
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
        else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        const mobileError = validateMobile();
        if (mobileError) {
            setErrors({ mobile: mobileError });
            return;
        }

        setLoading(true);
        Swal.fire({
            title: 'Sending OTP...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await api.post('/auth/send-otp', { mobile: form.mobile, purpose: 'register' });
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
                text: err.response?.data?.error || 'Failed to send OTP. Please try again.',
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
            await api.post('/auth/verify-otp', {
                mobile: form.mobile,
                code: otp,
                purpose: 'register',
            });
            Swal.fire({
                icon: 'success',
                title: 'OTP Verified',
                text: 'OTP verified successfully. Please complete your registration.',
                timer: 2000,
                showConfirmButton: false,
            });
            setStep('details');
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
        const mobileError = validateMobile();
        if (mobileError) {
            setErrors({ mobile: mobileError });
            return;
        }

        setLoading(true);
        Swal.fire({
            title: 'Resending OTP...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await api.post('/auth/resend-otp', { mobile: form.mobile, purpose: 'register' });
            Swal.fire({
                icon: 'success',
                title: 'OTP Resent',
                text: 'OTP resent successfully via WhatsApp.',
                timer: 2000,
                showConfirmButton: false,
            });
            setResendTimer(30);
            setStep('verify'); // Return to verify step if resending OTP
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Failed to resend OTP. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }

    async function register() {
        if (!validateForm()) return;

        setLoading(true);
        Swal.fire({
            title: 'Registering...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await api.post('/auth/verify-register-otp', {
                mobile: form.mobile,
                name: form.name,
                email: form.email,
                password: form.password,
            });
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'Awaiting approval. Please login to see your dashboard. Services will be available after approval.',
                showConfirmButton: true,
                timer: undefined,
            });

            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Registration failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen md:py-5 items-center justify-center bg-gray-50">
            <div className="flex md:flex-row flex-col-reverse w-full max-w-6xl md:rounded-2xl shadow-2xl bg-white overflow-hidden">
                {/* Left Side: Form */}
                <div className="md:w-1/2 w-full md:p-10 p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Retailer Registration</h2>

                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <div className="flex items-center gap-4">
                                <input
                                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'send' ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    placeholder="Enter 10-digit mobile number"
                                    value={form.mobile}
                                    onChange={handleMobileChange}
                                    maxLength={10}
                                    disabled={step !== 'send'}
                                />
                                {step === 'send' && (
                                    <button
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 whitespace-nowrap"
                                        onClick={sendOtp}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                            {errors.mobile && <p className="text-red-500 text-sm mt-2">{errors.mobile}</p>}
                            {step === 'details' && (
                                <p className="text-green-500 text-sm mt-2 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" /> OTP verified successfully
                                </p>
                            )}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'details' ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                placeholder="Enter your name"
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    setErrors({ ...errors, name: '' });
                                }}
                                disabled={step !== 'details'}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'details' ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={(e) => {
                                    setForm({ ...form, email: e.target.value });
                                    setErrors({ ...errors, email: '' });
                                }}
                                disabled={step !== 'details'}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'details' ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => {
                                    setForm({ ...form, password: e.target.value });
                                    setErrors({ ...errors, password: '' });
                                }}
                                disabled={step !== 'details'}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-8"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={step !== 'details'}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${step !== 'details' ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                placeholder="Confirm your password"
                                value={form.confirmPassword}
                                onChange={(e) => {
                                    setForm({ ...form, confirmPassword: e.target.value });
                                    setErrors({ ...errors, confirmPassword: '' });
                                }}
                                disabled={step !== 'details'}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-8"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={step !== 'details'}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                            </button>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={register}
                            disabled={loading || step !== 'details'}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : 'Register'}
                        </button>
                    </div>
                    <div className="text-sm text-center mt-4">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Login
                        </Link>
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
                                alt="Retail Services 1"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                src="/register-banner2.avif"
                                alt="Retail Services 2"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                src="/register-banner3.avif"
                                alt="Retail Services 3"
                                className="w-full h-full md:max-h-full max-h-[250px] object-cover"
                            />
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </div>
    );
}