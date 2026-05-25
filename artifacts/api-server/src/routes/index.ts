import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import serversRouter from "./servers";
import protectRouter from "./protect";
import maintenanceRouter from "./maintenance";
import statsRouter from "./stats";
import notificationsRouter from "./notifications";
import nodesRouter from "./nodes";
import serverResourcesRouter from "./server-resources";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(serversRouter);
router.use(serverResourcesRouter);
router.use(protectRouter);
router.use(maintenanceRouter);
router.use(statsRouter);
router.use(notificationsRouter);
router.use(nodesRouter);
router.use(settingsRouter);

export default router;
