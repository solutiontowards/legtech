import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Service from '../models/Service.js';
import SubService from '../models/SubService.js';
import Option from '../models/Option.js';
import FormField from '../models/Option.js'; // if used

// list pending retailers
export const getPendingRetailers = asyncHandler(async (req,res)=>{
  const pending = await User.find({ role: 'retailer', isVerified: false });
  res.json({ ok:true, pending });
});

export const verifyRetailer = asyncHandler(async (req,res)=>{
  const { retailerId, verified } = req.body;
  const user = await User.findById(retailerId);
  if (!user) return res.status(404).json({ error: 'Retailer not found' });
  user.isVerified = verified === true;
  await user.save();
  res.json({ ok:true, user });
});

// create service
export const createService = asyncHandler(async (req,res)=>{
  const { name, slug, description, image, imageMeta } = req.body;
  const svc = await Service.create({ name, slug, description, image, imageMeta });
  res.json({ ok:true, svc });
});

// create sub-service
export const createSubService = asyncHandler(async (req,res)=>{
  const { serviceId, name, slug, description, image, imageMeta } = req.body;
  const sub = await SubService.create({ serviceId, name, slug, description, image, imageMeta });
  await Service.findByIdAndUpdate(serviceId, { $push: { subServices: sub._id } });
  res.json({ ok:true, sub });
});

// create option
export const createOption = asyncHandler(async (req,res)=>{
  const { subServiceId, name, slug, price, image, imageMeta, externalLink, isExternal, formFields } = req.body;
  const option = await Option.create({ subServiceId, name, slug, price, image, imageMeta, externalLink, isExternal, formFields });
  await SubService.findByIdAndUpdate(subServiceId, { $push: { options: option._id } });
  res.json({ ok:true, option });
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
