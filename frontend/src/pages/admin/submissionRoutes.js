import express from "express";
import {
  createSubmission,
  verifyRazorpayPayment,
  listRetailerSubmissions,
  adminListSubmissions,
  getRetailerSubmissionById,
  getSubmissionById,
  updateSubmissionStatus,
  reUploadDocuments,
} from "../controllers/submissionController.js";
import { protect, admin, retailer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Retailer specific routes
router.route("/").post(protect, retailer, createSubmission);
router.route("/me").get(protect, retailer, listRetailerSubmissions);
router.route("/:submissionId").get(protect, retailer, getRetailerSubmissionById);
router.route("/:submissionId/re-upload").put(protect, retailer, reUploadDocuments);
router.route("/verify-payment").post(protect, retailer, verifyRazorpayPayment);

// Admin specific routes
router.route("/admin/all").get(protect, admin, adminListSubmissions);
router.route("/admin/:submissionId").get(protect, admin, getSubmissionById);
router.route("/admin/:submissionId/status").put(protect, admin, updateSubmissionStatus);

export default router;