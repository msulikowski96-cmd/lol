import { Router, type IRouter } from "express";
import healthRouter from "./health";
import summonerRouter from "./summoner";
import analysisRouter from "./analysis";
import championRouter from "./champion";
import matchRouter from "./match";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/summoner", summonerRouter);
router.use("/summoner", analysisRouter);
router.use("/summoner", championRouter);
router.use("/match", matchRouter);

export default router;
