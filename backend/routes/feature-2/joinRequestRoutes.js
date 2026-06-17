import express from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../../middleware/auth.js";
import {
  createJoinRequest,
  myJoinRequest,
  cancelJoinRequest,
} from "../../controllers/feature-2/joinRequestController.js";
import fs from "fs";
const router = express.Router();

// simple multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/join-docs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "application/pdf"].includes(
      file.mimetype,
    );
    cb(ok ? null : new Error("Only JPG/PNG/PDF allowed"), ok);
  },
});

router.post("/", requireAuth, upload.array("documents", 5), createJoinRequest);
router.get("/me", requireAuth, myJoinRequest);
router.patch("/:id/cancel", requireAuth, cancelJoinRequest);

export default router;
