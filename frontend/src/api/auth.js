import api from "./axios";

// Logout 
export const logout = () => api.post("/auth/logout");

// Forgot Password Flow
export const forgotPasswordSendOtp = (mobile) => 
    api.post("/auth/forgot-password", { mobile });

export const forgotPasswordVerifyOtp = (mobile, code) => 
    api.post("/auth/verify-forgot-password-otp", { mobile, code });

export const resetPassword = (mobile, code, password) => 
    api.post("/auth/reset-password", { mobile, code, password });

// Get Profile
export const getProfile = () => 
    api.get("/auth/profile");