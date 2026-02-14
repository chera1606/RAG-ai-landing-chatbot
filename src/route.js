import { Router } from "express";
import authRoute from "./module/auth/auth.route.js";
import uploadDataRoute from "./module/uploadData/upload.route.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/upload", uploadDataRoute);

export default router;
