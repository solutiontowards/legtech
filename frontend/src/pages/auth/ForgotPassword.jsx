import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState('mobile'); // 'mobile' -> 'verify' -> 'reset'
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState(''); // To store the temporary token
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (step === 'verify' && resendTimer > 0) {
            timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [step, resendTimer]);

    const handleStateChange = (setter, field) => (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setter(value);
        if (errors[field]) setErrors({ ...errors, [field]: '' });
    };

    const validateAndSendOtp = async () => {
        if (!/^\d{10}$/.test(mobile)) {
            return setErrors({ mobile: 'A 10-digit mobile number is required.' });
        }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { mobile });
            Swal.fire('OTP Sent', 'An OTP has been sent to your mobile number via WhatsApp.', 'success');
            setStep('verify');
            setResendTimer(30);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to send OTP.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateAndVerifyOtp = async () => {
        if (!/^\d{6}$/.test(otp)) {
            return setErrors({ otp: 'A 6-digit OTP is required.' });
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-forgot-password-otp', { mobile, code: otp });
            Swal.fire('OTP Verified', 'You can now set a new password.', 'success');
            setResetToken(response.data.resetToken); // Save the token from the backend
            setStep('reset');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Invalid OTP.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateAndResetPassword = async () => {
        const newErrors = {};
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { mobile, otp, password, resetToken });
            Swal.fire({
                title: 'Success!',
                text: 'Your password has been reset successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate('/login'));
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to reset password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setLoading(true);
        try {
            await api.post('/auth/resend-otp', { mobile, purpose: 'forgot-password' });
            Swal.fire('OTP Resent', 'A new OTP has been sent.', 'success');
            setResendTimer(30);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to resend OTP.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'mobile':
                return (
                    <>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Forgot Password</h2>
                        <p className="text-gray-600 mb-6">Enter your registered mobile number to receive an OTP.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <input
                                className="w-full p-3 border rounded-lg"
                                placeholder="10-digit mobile number"
                                value={mobile}
                                onChange={handleStateChange(setMobile, 'mobile')}
                                maxLength={10}
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                        </div>
                        <button onClick={validateAndSendOtp} disabled={loading} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Send OTP'}
                        </button>
                    </>
                );
            case 'verify':
                return (
                    <>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Verify OTP</h2>
                        <p className="text-gray-600 mb-6">An OTP has been sent to <span className="font-semibold">{mobile}</span>.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                            <input
                                className="w-full p-3 border rounded-lg"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={handleStateChange(setOtp, 'otp')}
                                maxLength={6}
                            />
                            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                        </div>
                        <button onClick={validateAndVerifyOtp} disabled={loading} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify OTP'}
                        </button>
                        <div className="text-center mt-4">
                            <button onClick={resendOtp} disabled={loading || resendTimer > 0} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </>
                );
            case 'reset':
                return (
                    <>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Reset Password</h2>
                        <p className="text-gray-600 mb-6 flex items-center"><CheckCircle className="text-green-500 mr-2" /> OTP Verified. Set your new password.</p>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full p-3 border rounded-lg"
                                placeholder="New password (min. 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                             <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center mt-8" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                        <button onClick={validateAndResetPassword} disabled={loading} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Reset Password'}
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-4">
                {renderStep()}
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-blue-600 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}