import { uploadService } from "./upload.service.js";

export const uploadController = {
  // Handle PDF/TXT Uploads
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file provided" });
      }
      const result = await uploadService.processFile(req.file);
      res.status(200).json(result);
    } catch (error) {
      console.error("Controller File Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Handle Manual Text Sync
  async uploadText(req, res) {
    try {
      const { text } = req.body;
      if (!text) {
        return res
          .status(400)
          .json({ success: false, error: "No text provided" });
      }
      const result = await uploadService.processRawText(text);
      res.status(200).json(result);
    } catch (error) {
      console.error("Controller Text Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
