import { Router, type IRouter, type Request, type Response } from "express";
import { getUncachableStripeClient } from "../stripeClient";
import { WebhookHandlers } from "../webhookHandlers";
import { pool } from "@workspace/db";
import { getUserFromRequest } from "../lib/auth";

const router: IRouter = Router();

async function ensurePaymentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_analysis_payments (
      session_id TEXT PRIMARY KEY,
      puuid TEXT NOT NULL,
      user_id UUID,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_aip_puuid ON ai_analysis_payments(puuid);
    CREATE INDEX IF NOT EXISTS idx_aip_user_puuid ON ai_analysis_payments(user_id, puuid);
  `);
  await pool.query(`
    ALTER TABLE ai_analysis_payments ADD COLUMN IF NOT EXISTS user_id UUID;
  `).catch(() => {});
}

ensurePaymentsTable().catch(console.error);

router.post("/stripe/create-ai-checkout", async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Musisz być zalogowany, aby dokonać płatności" });
    return;
  }

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
      customer_email: user.email,
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
      success_url: `${successUrl}?paid=1`,
      cancel_url: cancelUrl,
      metadata: {
        puuid,
        region,
        gameName: gameName ?? "",
        tagLine: tagLine ?? "",
        userId: user.userId,
      },
      locale: "pl",
    });

    await pool.query(
      `INSERT INTO ai_analysis_payments (session_id, puuid, user_id, status) VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (session_id) DO NOTHING`,
      [session.id, puuid, user.userId],
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "stripe_error", message: err?.message ?? "Błąd płatności" });
  }
});

router.get("/stripe/check-access", async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.json({ hasAccess: false, reason: "not_logged_in" });
    return;
  }

  const { puuid } = req.query as { puuid: string };
  if (!puuid) {
    res.status(400).json({ hasAccess: false, error: "missing_puuid" });
    return;
  }

  try {
    const hasAccess = await checkPaymentForUser(user.userId, puuid);
    res.json({ hasAccess });
  } catch (err: any) {
    res.status(500).json({ hasAccess: false, error: err?.message });
  }
});

router.post("/stripe/verify-after-payment", async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ hasAccess: false, error: "unauthorized" });
    return;
  }

  const { puuid } = req.body as { puuid: string };
  if (!puuid) {
    res.status(400).json({ hasAccess: false, error: "missing_puuid" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    let confirmed = false;
    for (const session of sessions.data) {
      if (
        session.payment_status === "paid" &&
        session.metadata?.userId === user.userId &&
        session.metadata?.puuid === puuid
      ) {
        const existingRow = await pool.query(
          "SELECT status FROM ai_analysis_payments WHERE session_id = $1",
          [session.id],
        );
        if (existingRow.rows.length === 0 || existingRow.rows[0].status !== "paid") {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await pool.query(
            `INSERT INTO ai_analysis_payments (session_id, puuid, user_id, status, paid_at, expires_at)
             VALUES ($1, $2, $3, 'paid', NOW(), $4)
             ON CONFLICT (session_id) DO UPDATE
             SET status = 'paid', paid_at = NOW(), expires_at = $4, user_id = $3`,
            [session.id, puuid, user.userId, expiresAt],
          );
        }
        confirmed = true;
        break;
      }
    }

    res.json({ hasAccess: confirmed || await checkPaymentForUser(user.userId, puuid) });
  } catch (err: any) {
    console.error("Verify after payment error:", err);
    res.status(500).json({ hasAccess: false, error: err?.message });
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

export async function checkPaymentForUser(userId: string, puuid: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT status, expires_at FROM ai_analysis_payments
     WHERE user_id = $1 AND puuid = $2 AND status = 'paid'
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId, puuid],
  );
  return result.rows.length > 0;
}

export default router;
