import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import subscriptionsRouter from "./subscriptions";
import documentsRouter from "./documents";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(subscriptionsRouter);
router.use(documentsRouter);

export default router;
