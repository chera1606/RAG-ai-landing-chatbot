import multer from "multer";

const storage = multer.memoryStorage(); // Store in memory so LangChain can read it immediately
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Text files are supported"), false);
    }
  },
});
