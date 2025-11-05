import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import SubService from '../models/SubService.js';
import Option from '../models/Option.js';

export const listServices = asyncHandler(async (req,res)=>{
  const services = await Service.find({ isActive: true }).populate({
    path: "subServices",
    match: { isActive: true },
    populate: {
      path: "options",
      match: { isActive: true },
    },
  });
  res.json({ ok:true, services });
});

export const getServiceDetail = asyncHandler(async (req,res)=>{
  const { serviceSlug, subServiceSlug } = req.params;
  const service = await Service.findOne({ slug: serviceSlug }).populate({
    path: "subServices",
    match: { isActive: true },
    populate: {
      path: "options",
      match: { isActive: true },
    },
  });

  if (!service) return res.status(404).json({ ok: false, message: 'Service not found.' });
  if (!service.isActive) return res.status(404).json({ ok: false, message: 'This service is currently not active.' });

  let subService = null;
  if (subServiceSlug) {
    const rawSubService = await SubService.findOne({ serviceId: service._id, slug: subServiceSlug });
    if (!rawSubService) return res.status(404).json({ ok: false, message: 'Sub-service not found.' });
    if (!rawSubService.isActive) return res.status(404).json({ ok: false, message: 'This sub-service is currently not active.' });

    // If active, populate it with active options
    subService = await SubService.findById(rawSubService._id).populate({
      path: 'options',
      match: { isActive: true }
    });
  }
  res.json({ ok:true, service, subService });
});

export const getOptionDetail = asyncHandler(async (req, res) => {
  const { serviceSlug, subServiceSlug, optionSlug } = req.params;

  // 1. Find the parent service by its slug
  const service = await Service.findOne({ slug: serviceSlug });
  if (!service) return res.status(404).json({ ok: false, message: "Parent service not found." });
  if (!service.isActive) return res.status(404).json({ ok: false, message: "The parent service is currently not active." });

  // 2. Find the sub-service by its slug and parent service's ID
  const subService = await SubService.findOne({ serviceId: service._id, slug: subServiceSlug });
  if (!subService) return res.status(404).json({ ok: false, message: "Parent sub-service not found." });
  if (!subService.isActive) return res.status(404).json({ ok: false, message: "The parent sub-service is currently not active." });

  // 3. Find the option by its slug and parent sub-service's ID
  const option = await Option.findOne({ subServiceId: subService._id, slug: optionSlug });
  if (!option) return res.status(404).json({ ok: false, message: "The requested service option was not found." });
  if (!option.isActive) return res.status(404).json({
    ok: false,
    message: "This service option is currently not active and cannot be applied for.",
    code: "INACTIVE_OPTION"
  });

  // Convert to a plain object to add properties
  const optionObject = option.toObject();
  optionObject.serviceId = service._id; // Add serviceId to the response

  res.json({ ok: true, option: optionObject });
});

// Get Couting for service count in number lenth for count
export const getServiceCount = asyncHandler(async (req, res) => {
  const count = await Service.countDocuments({ isActive: true });
  res.json({ ok: true, count });
});
