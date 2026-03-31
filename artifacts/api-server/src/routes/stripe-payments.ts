import { Router, type IRouter, type Request, type Response } from "express";
import { getUncachableStripeClient } from "../stripeClient";
import { WebhookHandlers } from "../webhookHandlers";
import { pool } from "@workspace/db";

const router: IRouter = Router();

async function ensurePaymentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_analysis_payments (
      session_id TEXT PRIMARY KEY,
      puuid TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_aip_puuid ON ai_analysis_payments(puuid);
  `);
}

ensurePaymentsTable().catch(console.error);

router.post("/stripe/create-ai-checkout", async (req: Request, res: Response) => {
  const { puuid, region, gameName, tagLine, successUrl, cancelUrl } = req.body as {
    puuid: string;
    region: string;
    gameName: string;
    tagLine: string;
    successUrl: string;
    cancelUrl: string;
  };

  if (!puuid || !region || !successUrl || !cancelUrl) {
    res.status(400).json({ error: "bad_request", message: "puuid, region, successUrl, cancelUrl są wymagane" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik", "p24"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: "Nexus Sight — Analiza AI",
              description: `Szczegółowy raport AI dla gracza ${gameName ?? ""}#${tagLine ?? ""} w League of Legends`,
              images: ["https://nexus-sight.onrender.com/og-image.png"],
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        puuid,
        region,
        gameName: gameName ?? "",
        tagLine: tagLine ?? "",
      },
      locale: "pl",
    });

    await pool.query(
      `INSERT INTO ai_analysis_payments (session_id, puuid, status) VALUES ($1, $2, 'pending')
       ON CONFLICT (session_id) DO NOTHING`,
      [session.id, puuid],
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "stripe_error", message: err?.message ?? "Błąd płatności" });
  }
});

router.get("/stripe/verify-payment", async (req: Request, res: Response) => {
  const { sessionId, puuid } = req.query as { sessionId: string; puuid: string };

  if (!sessionId || !puuid) {
    res.status(400).json({ paid: false, error: "missing_params" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT status, expires_at FROM ai_analysis_payments
       WHERE session_id = $1 AND puuid = $2`,
      [sessionId, puuid],
    );

    if (result.rows.length === 0) {
      res.json({ paid: false, reason: "not_found" });
      return;
    }

    const row = result.rows[0];
    if (row.status !== "paid") {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid" && session.metadata?.puuid === puuid) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await pool.query(
          `UPDATE ai_analysis_payments
           SET status = 'paid', paid_at = NOW(), expires_at = $1
           WHERE session_id = $2`,
          [expiresAt, sessionId],
        );
        res.json({ paid: true });
        return;
      }

      res.json({ paid: false, reason: "not_paid" });
      return;
    }

    const expiry = row.expires_at ? new Date(row.expires_at) : null;
    if (expiry && expiry < new Date()) {
      res.json({ paid: false, reason: "expired" });
      return;
    }

    res.json({ paid: true });
  } catch (err: any) {
    console.error("Payment verify error:", err);
    res.status(500).json({ paid: false, error: err?.message });
  }
});

router.post("/stripe/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    res.status(400).json({ error: "No signature" });
    return;
  }

  try {
    await WebhookHandlers.processWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    res.status(400).json({ error: err?.message });
  }
});

export async function checkPaymentForPuuid(puuid: string, sessionId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT status, expires_at FROM ai_analysis_payments
     WHERE session_id = $1 AND puuid = $2 AND status = 'paid'`,
    [sessionId, puuid],
  );

  if (result.rows.length === 0) return false;
  const row = result.rows[0];
  const expiry = row.expires_at ? new Date(row.expires_at) : null;
  if (expiry && expiry < new Date()) return false;
  return true;
}

export default router;
