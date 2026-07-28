import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import subscriptionsRouter from "./subscriptions";
import documentsRouter from "./documents";
import contractsRouter from "./contracts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(subscriptionsRouter);
router.use(documentsRouter);
router.use("/contracts", contractsRouter);

export default router;
