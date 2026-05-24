import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import serversRouter from "./servers";
import protectRouter from "./protect";
import maintenanceRouter from "./maintenance";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(serversRouter);
router.use(protectRouter);
router.use(maintenanceRouter);
router.use(statsRouter);

export default router;
