import asyncHandler from "express-async-handler";
import Wishes from "../models/Wishes.js";


export const createWish = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Check if an active wish already exists
  const existingActiveWish = await Wishes.findOne({ isActive: true });
  if (existingActiveWish) {
    return res.status(400).json({
      error: "An active message already exists. Please deactivate it before creating a new one.",
    });
  }

  const wish = await Wishes.create({ message });

  res.status(201).json({ ok: true, wish });
});

export const getActiveWishes = asyncHandler(async (req, res) => {
  const wishes = await Wishes.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ ok: true, wishes });
});


export const getAllWishes = asyncHandler(async (req, res) => {
  const wishes = await Wishes.find({}).sort({ createdAt: -1 });
  res.json({ ok: true, wishes });
});


export const updateWish = asyncHandler(async (req, res) => {
  const { message, isActive } = req.body;
  const wish = await Wishes.findById(req.params.id);

  if (!wish) return res.status(404).json({ ok: false, message: "Wish not found" });

  wish.message = message ?? wish.message;
  if (typeof isActive === 'boolean') wish.isActive = isActive;

  const updatedWish = await wish.save();
  res.json({ ok: true, wish: updatedWish });
});


export const deleteWish = asyncHandler(async (req, res) => {
  const wish = await Wishes.findById(req.params.id);
  if (!wish) return res.status(404).json({ ok: false, message: "Wish not found" });

  await wish.deleteOne();
  res.json({ ok: true, message: "Wish deleted successfully" });
});