import { Router } from "express";

import { auth } from "../middleware/auth.js";
import {
    getAllReports,
    getRmWiseReport,
} from "../controllers/report.controller.js";


const router = Router();

router.get('/getallreports', auth, getAllReports);
router.get('/getrmwisereport', auth, getRmWiseReport);


export default router;