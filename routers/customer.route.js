import { Router } from "express";
import { checkPermission } from "../middleware/checkPermission.js";
import { auth } from "../middleware/auth.js";
import { allCustomers, customer } from "../controllers/customer.controler.js";


const route = Router()

route.get("/all", auth, checkPermission, allCustomers)
route.get("/single", auth, checkPermission, customer)


export default route