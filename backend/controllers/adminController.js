import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import KycDetail from '../models/KycDetail.js';
import { sendGenericWhatsAppMessage } from './authController.js';
import Service from '../models/Service.js';
import SubService from '../models/SubService.js';
import Option from '../models/Option.js';
import { adminListSubmissions, getSubmissionById, updateSubmissionStatus } from './submissionController.js';

// list pending retailers
export const getPendingRetailers = asyncHandler(async (req,res)=>{
  const pending = await User.find({ role: 'retailer', isKycVerified: false }).populate('kycDetails', 'status');
  res.json({ ok:true, pending });
});


// Get all retailers Retailer
export const getRetailers = asyncHandler(async (req,res)=>{
  const retailers = await User.find({ role: 'retailer',  isKycVerified: true })
    .populate('kycDetails')
    .populate('walletId', 'balance');
  res.json({ ok:true, retailers });
});

// Get all Admin 
export const getAdmins = asyncHandler(async (req,res)=>{
  const admins = await User.find({ role: 'admin' });
  res.json({ ok:true, admins });
});




// Activate or Deactivate a User
export const updateUser = asyncHandler(async (req, res) => {
  const { userId, isActive } = req.body;

  // Validation checks
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    user,
  });
});



// ===================== CREATE USER (ADMIN/RETAILER) BY ADMIN =====================
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, password, role } = req.body;

  if (!name || !email || !mobile || !password || !role) {
    return res.status(400).json({ ok: false, message: "All fields are required" });
  }

  if (!['admin', 'retailer'].includes(role)) {
    return res.status(400).json({ ok: false, message: "Invalid user role specified" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
    return res.status(400).json({ ok: false, message: "User with this email or mobile already exists" });
  }

  const user = new User({
    name,
    email,
    mobile,
    role,
    isKycVerified: role === 'admin', // Admins are auto-verified, retailers are not
    isOtpVerified: true, // OTP is bypassed
  });

  await user.setPassword(password);

  // Create a wallet only if the user is a retailer
  if (role === 'retailer') {
    const wallet = await Wallet.create({ retailerId: user._id, balance: 0 });
    user.walletId = wallet._id;
  }

  await user.save();

  // Send a welcome message if a retailer is created
  if (role === 'retailer') {
    const welcomeMessage = `Hello ${name},

Thank you for registering with Legtech! 🎉  
Your account has been successfully created by an admin.

Your login credentials are:
Mobile: ${mobile}
Password: ${password}

Please log in at https://legtech.in/login and complete your KYC verification to activate your account and access all services.

Best regards,  
The Legtech Team`;

    try {
      await sendGenericWhatsAppMessage(mobile, welcomeMessage);
    } catch (error) {
      console.error("Failed to send welcome message from admin creation:", error);
    }
  }

  // Don't send back the password hash
  user.passwordHash = undefined;

  res.status(201).json({ ok: true, message: `User (${role}) created successfully`, user });
});

// ===================== KYC MANAGEMENT =====================

// @desc    Get all pending KYC verification requests
// @route   GET /api/admin/kyc-pending
// @access  Private (Admin)
export const getPendingKycRequests = asyncHandler(async (req, res) => {
  const requests = await KycDetail.find({ status: 'pending' }).populate('retailerId', 'name email mobile');
  res.json({ ok: true, requests });
});

// @desc    Get a single KYC request by its ID
// @route   GET /api/admin/kyc/:id
// @access  Private (Admin)
export const getKycRequestById = asyncHandler(async (req, res) => {
  const request = await KycDetail.findById(req.params.id).populate('retailerId', 'name email mobile createdAt');
  if (!request) {
    return res.status(404).json({ message: 'KYC request not found.' });
  }
  res.json({ ok: true, request });
});

// @desc    Get KYC details by Retailer ID
// @route   GET /api/admin/kyc/retailer/:retailerId
// @access  Private (Admin)
export const getKycDetailsByRetailerId = asyncHandler(async (req, res) => {
  const { retailerId } = req.params;
  const retailer = await User.findById(retailerId).select('name email mobile createdAt');
  if (!retailer) {
    return res.status(404).json({ message: 'Retailer not found.' });
  }

  const details = await KycDetail.findOne({ retailerId: retailerId });
  if (!details) {
    return res.status(404).json({ message: 'KYC details not found for this retailer.' });
  }

  res.json({ ok: true, details: { retailer, details } });
});


// @desc    Verify or reject a KYC request
// @route   PUT /api/admin/kyc/:id/status
// @access  Private (Admin)
export const updateKycStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body; // status can be 'approved' or 'rejected'

  const kycRequest = await KycDetail.findById(req.params.id);
  if (!kycRequest) {
    return res.status(404).json({ message: 'KYC request not found.' });
  }

  if (status === 'approved') {
    kycRequest.status = 'approved';
    kycRequest.rejectionReason = undefined;
    await User.findByIdAndUpdate(kycRequest.retailerId, { isKycVerified: true });
    
    const user = await User.findById(kycRequest.retailerId);
    if (user) {
      const welcomeMessage = `Hello ${user.name},\n\n🎉 Congratulations! Your KYC has been successfully verified by the Legtech Admin Team.\n\nYou now have full access to all platform features and services.\n\nBest regards,\nTeam Legtech`;
      try {
        await sendGenericWhatsAppMessage(user.mobile, welcomeMessage);
      } catch (error) {
        console.error("Failed to send KYC approval notification:", error);
      }
    }

    // You can add a WhatsApp notification here for approval
  } else if (status === 'rejected') {
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }
    kycRequest.status = 'rejected';
    kycRequest.rejectionReason = rejectionReason;
    await User.findByIdAndUpdate(kycRequest.retailerId, { isKycVerified: false });
    // You can add a WhatsApp notification here for rejection
    const user = await User.findById(kycRequest.retailerId);
    if (user) {
      const rejectionMessage = `Hello ${user.name},\n\nWe regret to inform you that your KYC submission has been rejected.\n\nReason: ${rejectionReason}\n\nPlease log in to your dashboard to correct the details and re-submit.\n\nBest regards,\nTeam Legtech`;
      try {
        await sendGenericWhatsAppMessage(user.mobile, rejectionMessage);
      } catch (error) {
        console.error("Failed to send KYC rejection notification:", error);
      }
    }
  }
  await kycRequest.save();
  res.json({ ok: true, message: `KYC request has been ${status}.`, kycRequest });
});

// ===================== CREATE SERVICE =====================
export const createService = asyncHandler(async (req, res) => {
  const { name, slug, description, image, imageMeta, isActive = true } = req.body;

  const existingService = await Service.findOne({ name: name.trim() });
  if (existingService) {
    return res.status(400).json({
      ok: false,
      message: "Service with this name already exists",
    });
  }

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const svc = await Service.create({
    name: name.trim(),
    slug: generatedSlug,
    description,
    image,
    imageMeta,
    isActive,
  });

  res.status(201).json({ ok: true, svc });
});


// listServices Get
export const getAllServices = asyncHandler(async (req,res)=>{
  const services = await Service.find().populate({ path:'subServices', populate: { path: 'options' } });
  res.json({ ok:true, services });
});



// ===================== UPDATE SERVICE =====================
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, image, imageMeta, isActive } = req.body;

  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ ok: false, message: "Service not found" });
  }

  // Check duplicate name
  if (name && name.trim() !== service.name) {
    const exists = await Service.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ ok: false, message: "Service name already exists" });
    }
  }

  service.name = name?.trim() || service.name;
  service.slug =
    slug ||
    name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    service.slug;
  service.description = description ?? service.description;
  service.image = image ?? service.image;
  service.imageMeta = imageMeta ?? service.imageMeta;
  if (typeof isActive === "boolean") service.isActive = isActive;

  await service.save();
  res.json({ ok: true, service });
});


// Get service by ID (for edit)
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ ok: false, message: "Service not found" });
  }
  res.json({ ok: true, service });
});


// Get service by slug for edit
export const getServiceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const service = await Service.findOne({ slug });  
  if (!service) {
    return res.status(404).json({ ok: false, message: "Service not found" });
  }
  res.json({ ok: true, service });
});


// ===================== CREATE SUB-SERVICE =====================
export const createSubService = asyncHandler(async (req, res) => {
  const { serviceId, name, slug, description, image, imageMeta, isActive = true } = req.body;

  const existingSub = await SubService.findOne({ name: name.trim(), serviceId });
  if (existingSub) {
    return res.status(400).json({
      ok: false,
      message: "Sub-service with this name already exists under the selected service",
    });
  }

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const sub = await SubService.create({
    serviceId,
    name: name.trim(),
    slug: generatedSlug,
    description,
    image,
    imageMeta,
    isActive,
  });

  await Service.findByIdAndUpdate(serviceId, { $push: { subServices: sub._id } });

  res.status(201).json({ ok: true, sub });
});


// ===================== UPDATE SUB-SERVICE =====================
export const updateSubService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, image, imageMeta, isActive } = req.body;

  const sub = await SubService.findById(id);
  if (!sub) return res.status(404).json({ ok: false, message: "Sub-service not found" });

  // Duplicate name check within same service
  if (name && name.trim() !== sub.name) {
    const exists = await SubService.findOne({ name: name.trim(), serviceId: sub.serviceId });
    if (exists)
      return res
        .status(400)
        .json({ ok: false, message: "Sub-service name already exists under this service" });
  }

  sub.name = name?.trim() || sub.name;
  sub.slug =
    slug ||
    name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    sub.slug;
  sub.description = description ?? sub.description;
  sub.image = image ?? sub.image;
  sub.imageMeta = imageMeta ?? sub.imageMeta;
  if (typeof isActive === "boolean") sub.isActive = isActive;

  await sub.save();
  res.json({ ok: true, sub });
});

// getSubServiceBySlug 
export const getSubServiceBySlug = asyncHandler(async (req, res) => {
  const { serviceSlug, subServiceSlug } = req.params;
  const service = await Service.findOne({ slug: serviceSlug });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  const subService = await SubService.findOne({ serviceId: service._id, slug: subServiceSlug });
  if (!subService) return res.status(404).json({ error: 'Sub-service not found' });
  res.json({ ok: true, subService });
});



// ===================== CREATE OPTION =====================
export const createOption = asyncHandler(async (req, res) => {
  const {
    subServiceId,
    name,
    slug,
    customerPrice,
    retailerPrice,
    image,
    imageMeta,
    externalLink,
    isExternal,
    formFields,
    isActive = true,
  } = req.body;

  const existingOption = await Option.findOne({ name: name.trim(), subServiceId });
  if (existingOption) {
    return res.status(400).json({
      ok: false,
      message: "Option with this name already exists under the selected sub-service",
    });
  }

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const option = await Option.create({
    subServiceId,
    name: name.trim(),
    slug: generatedSlug,
    customerPrice,
    retailerPrice,
    image,
    imageMeta,
    externalLink,
    isExternal,
    formFields,
    isActive,
  });

  await SubService.findByIdAndUpdate(subServiceId, { $push: { options: option._id } });
  res.status(201).json({ ok: true, option });
});


// ===================== UPDATE OPTION =====================
export const updateOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, customerPrice, retailerPrice, image, imageMeta, externalLink, isExternal, formFields, isActive } =
    req.body;

  const option = await Option.findById(id);
  if (!option) return res.status(404).json({ ok: false, message: "Option not found" });

  if (name && name.trim() !== option.name) {
    const exists = await Option.findOne({ name: name.trim(), subServiceId: option.subServiceId });
    if (exists)
      return res
        .status(400)
        .json({ ok: false, message: "Option name already exists under this sub-service" });
  }

  option.name = name?.trim() || option.name;
  option.slug =
    slug ||
    name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    option.slug;
  option.customerPrice = customerPrice ?? option.customerPrice;
  option.retailerPrice = retailerPrice ?? option.retailerPrice;
  option.image = image ?? option.image;
  option.imageMeta = imageMeta ?? option.imageMeta;
  option.externalLink = externalLink ?? option.externalLink;
  option.isExternal = isExternal ?? option.isExternal;
  option.formFields = formFields ?? option.formFields;
  if (typeof isActive === "boolean") option.isActive = isActive;

  await option.save();
  res.json({ ok: true, option });
});

// Get option by slug for edit
export const getOptionBySlug = asyncHandler(async (req, res) => {
  const { serviceSlug, subServiceSlug, optionSlug } = req.params;

  const service = await Service.findOne({ slug: serviceSlug });
  if (!service) return res.status(404).json({ ok: false, message: "Service not found" });

  const subService = await SubService.findOne({ serviceId: service._id, slug: subServiceSlug });
  if (!subService) return res.status(404).json({ ok: false, message: "Sub-service not found" });

  const option = await Option.findOne({ subServiceId: subService._id, slug: optionSlug });
  if (!option) return res.status(404).json({ ok: false, message: "Option not found" });

  res.json({ ok: true, option });
});



// add form field (optional)
export const createFormField = asyncHandler(async (req,res)=>{
  const { optionId, label, name, type, placeholder, required, accept, isPdf } = req.body;
  // if using embedded fields:
  const option = await Option.findById(optionId);
  if (!option) return res.status(404).json({ error: 'Option not found' });
  option.formFields.push({ label, name, type, placeholder, required, accept, isPdf });
  await option.save();
  res.json({ ok:true, option });
});



// Get Couting for service count in number lenth for count
export const getServiceCount = asyncHandler(async (req, res) => {
  const count = await Service.countDocuments();
  res.json({ ok: true, count });
});

// get pending reatiler count
export const getPendingRetailerCount  = asyncHandler(async (req, res) => {
  const count = await KycDetail.countDocuments({ status: 'pending' });
  res.json({ ok: true, count });
});

// get retailer count
export const getRetailerCount= asyncHandler(async (req, res) => {
  const count = await User.countDocuments({ role: 'retailer' });
  res.json({ ok: true, count });
});

// ===================== SUBMISSIONS =====================
export {
  adminListSubmissions,
  getSubmissionById,
  updateSubmissionStatus
};