import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { checkPermission } from "../middleware/checkPermission.js";
import {
    getExtScheme,
    getSaleReturn,
    getFinal,
    getYrQt,
    getPlans,
    getNrvRaw,
    getIncentiveMahaMahurat, getIncentivePlanOne, getIncentivePlanTwo, 
    getIncentivePlanThree,
    getIncentivePlanFour
} from "../controllers/incentive.controller.js";

const router = Router()

router.get('/getyrqt', auth, getYrQt)
router.get('/getplans', auth, getPlans)
router.get('/getnrvraw', auth, getNrvRaw)
router.get('/getIncentiveMahaMahurat', auth, getIncentiveMahaMahurat)
router.get('/getIncentivePlanOne', auth, getIncentivePlanOne)
router.get('/getIncentivePlanTwo', auth, getIncentivePlanTwo)
router.get('/getIncentivePlanthree', auth, getIncentivePlanThree)
router.get('/getIncentivePlanFour',auth,getIncentivePlanFour)


export default router