import { Router } from "express";
import userRouter from '../routers/user.routes.js'
import saleRouter from '../routers/sale.route.js'
import customerRouter from '../routers/customer.route.js'
import statisticsRouter from '../routers/stats.router.js'
import incentiveRouter from '../routers/incentive.route.js'
import dashboardRouter from '../routers/dashboard.router.js'
import masterRouter from '../routers/master.router.js'
import reportRouter from '../routers/reports.js'
import doctorRouter from './doctor.router.js'
import ocrRouter from './ocr.router.js'

const router = Router();

// public
router.use("/user", userRouter);

router.use("/sales", saleRouter);

router.use('/customer', customerRouter)

router.use('/statistics', statisticsRouter)

router.use('/incentive', incentiveRouter)

router.use('/dashboard', dashboardRouter)

router.use('/master', masterRouter)

router.use('/report', reportRouter)

router.use('/doctor', doctorRouter)

router.use('/ocr', ocrRouter)

export default router;
