import { Router, type IRouter } from "express";
import healthRouter from "./health";
import summonerRouter from "./summoner";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/summoner", summonerRouter);

export default router;
