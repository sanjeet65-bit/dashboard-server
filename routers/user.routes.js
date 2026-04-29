import { Router } from "express";
import { Menu } from "../controllers/menu.controller.js";
import { login, logout} from "../controllers/auth.controller.js";
import { auth, verifyme } from "../middleware/auth.js";
import { getProfile, getMenuItems, setPassword , resetPassword} from "../controllers/users.controller.js";



const router = Router()

router.post('/login', login)
router.post('/verifyme', verifyme)
router.post('/logout', logout)

router.get('/getProfile', auth, getProfile)
router.get('/getMenuItems', auth, getMenuItems)

router.post('/setpassword', auth, setPassword)
router.post('/resetpassword', auth, resetPassword)








export default router