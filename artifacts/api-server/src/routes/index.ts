import { Router, type IRouter } from "express";
import healthRouter from "./health";
import serversRouter from "./servers";
import filesRouter from "./files";
import chatRouter from "./chat";
import adminRouter from "./admin";
import panelRouter from "./panel";

const router: IRouter = Router();

router.use(healthRouter);
router.use(serversRouter);
router.use(filesRouter);
router.use(chatRouter);
router.use(adminRouter);
router.use(panelRouter);

export default router;
