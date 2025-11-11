import express from "express";
import { paymentCallback } from "../controllers/walletController.js";

const router = express.Router();

// This route will receive the POST request from the payment gateway.
router.post("/callback", paymentCallback);

export default router;