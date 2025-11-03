import asyncHandler from 'express-async-handler';
import Notice from '../models/Notice.js';

// @desc    Get all notices (for admin)
// @route   GET /api/notices/all
// @access  Admin
export const getAllNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
  res.json({ ok: true, notices });
});

// @desc    Get active notices (for retailers)
// @route   GET /api/notices
// @access  Public/Retailer
export const getActiveNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ ok: true, notices });
});

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Admin
export const createNotice = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ ok: false, message: 'Notice text is required' });
  }
  const notice = await Notice.create({ text, createdBy: req.user._id });
  res.status(201).json({ ok: true, notice });
});

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Admin
export const updateNotice = asyncHandler(async (req, res) => {
  const { text, isActive } = req.body;
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ ok: false, message: 'Notice not found' });

  notice.text = text ?? notice.text;
  if (typeof isActive === 'boolean') notice.isActive = isActive;
  const updatedNotice = await notice.save();
  res.json({ ok: true, notice: updatedNotice });
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Admin
export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ ok: false, message: 'Notice not found' });
  await notice.deleteOne();
  res.json({ ok: true, message: 'Notice deleted successfully' });
});