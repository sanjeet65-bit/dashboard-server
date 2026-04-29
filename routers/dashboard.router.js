import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { saleTrend } from "../controllers/dashboard.controller.js";

const router = Router();

router.post("/saletrend",auth,saleTrend)



export default router