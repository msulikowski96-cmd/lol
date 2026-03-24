import { Router, type IRouter } from "express";
import healthRouter from "./health";
import summonerRouter from "./summoner";
import analysisRouter from "./analysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/summoner", summonerRouter);
router.use("/summoner", analysisRouter);

export default router;
