import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getDoctorMst, getDoctorMstById, updateDoctorMst } from "../controllers/form.controller.js";

const router = Router()

router.get('/getDoctorMst', auth, getDoctorMst)
router.get('/getDoctorMstById/:DoctCd', auth, getDoctorMstById)
router.put('/updateDoctorMst', auth, updateDoctorMst)


export default router