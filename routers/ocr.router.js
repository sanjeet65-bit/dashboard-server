import { Router } from "express";
import { extractPharmacy, savePharmacy } from '../controllers/ocr.controller.js';
import { auth } from "../middleware/auth.js";

const router = Router();

router.post('/extract', auth, extractPharmacy);
router.post('/save',    auth, savePharmacy);

export default router;