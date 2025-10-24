import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import SubService from '../models/SubService.js';
import Option from '../models/Option.js';

export const listServices = asyncHandler(async (req,res)=>{
  const services = await Service.find().populate({ path:'subServices', populate: { path: 'options' } });
  res.json({ ok:true, services });
});

export const getServiceDetail = asyncHandler(async (req,res)=>{
  const { serviceSlug, subServiceSlug } = req.params;
  const service = await Service.findOne({ slug: serviceSlug }).populate({ path:'subServices', populate: { path: 'options' } });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  let subService = null;
  if (subServiceSlug) {
    subService = await SubService.findOne({ serviceId: service._id, slug: subServiceSlug }).populate({ path: 'options' });
  }
  res.json({ ok:true, service, subService });
});
