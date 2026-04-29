import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { sale, salereturn, collection, getTarget } from "../controllers/sale.controller.js";
import { checkPermission } from "../middleware/checkPermission.js";

const router = Router()

router.post('/sale', auth, checkPermission, sale)
router.post('/salereturn', auth, salereturn)
router.post('/collection', auth, collection)
router.post('/target', auth, getTarget)



export default router