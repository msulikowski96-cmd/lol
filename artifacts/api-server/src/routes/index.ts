import { Router, type IRouter } from "express";
import healthRouter from "./health";
import summonerRouter from "./summoner";
import analysisRouter from "./analysis";
import championRouter from "./champion";
import matchRouter from "./match";
import aiAnalysisRouter from "./ai-analysis";
import stripePaymentsRouter from "./stripe-payments";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/summoner", summonerRouter);
router.use("/summoner", analysisRouter);
router.use("/summoner", championRouter);
router.use("/summoner", aiAnalysisRouter);
router.use("/match", matchRouter);
router.use(stripePaymentsRouter);

export default router;
