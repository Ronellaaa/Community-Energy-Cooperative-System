import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/join-docs"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

export const uploadJoinDocs = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // max 5 files, 5MB each
  fileFilter: (req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) return cb(new Error("Only JPG, PNG, PDF allowed"));
    cb(null, true);
  },
}).array("documents", 5);