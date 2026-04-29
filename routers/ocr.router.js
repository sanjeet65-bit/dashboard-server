import { Router } from "express";
import { scanPharmacy } from '../controllers/ocr.controller.js'
import { auth } from "../middleware/auth.js";


const router = Router()


router.post('/scan', auth, scanPharmacy)



export default router