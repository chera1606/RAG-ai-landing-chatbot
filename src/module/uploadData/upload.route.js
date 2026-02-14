import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { upload } from "../../middleware/multer.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = Router();

// Notice: isAdmin is removed from these routes
router.post(
  "/file",
  verifyToken,
  upload.single("file"),
  uploadController.uploadFile,
);
router.post("/text", verifyToken, uploadController.uploadText);

export default router;
