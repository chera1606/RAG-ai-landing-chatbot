import multer from "multer";

// Store file in memory so we can process it with LangChain
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDFs and Plain Text
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Text files are supported"), false);
    }
  },
});
