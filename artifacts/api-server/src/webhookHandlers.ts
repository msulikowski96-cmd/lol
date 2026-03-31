import { getUncachableStripeClient } from "./stripeClient";
import { pool } from "@workspace/db";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
        "This usually means express.json() parsed the body before this handler. " +
        "FIX: Ensure webhook route is registered BEFORE app.use(express.json())."
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification (unsafe in production)");
      const event = JSON.parse(payload.toString());
      await WebhookHandlers.handleEvent(event);
      return;
    }

    const stripe = await getUncachableStripeClient();
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Stripe webhook signature verification failed: ${err.message}`);
    }

    await WebhookHandlers.handleEvent(event);
  }

  static async handleEvent(event: any): Promise<void> {
    console.log(`[Stripe Webhook] Event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const puuid: string | undefined = session.metadata?.puuid;
      const userId: string | undefined = session.metadata?.userId;

      if (!puuid) {
        console.warn("[Stripe Webhook] checkout.session.completed — brak puuid w metadata, pomijam");
        return;
      }

      if (session.payment_status !== "paid") {
        console.warn(`[Stripe Webhook] Session ${session.id} payment_status=${session.payment_status}, pomijam`);
        return;
      }

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO ai_analysis_payments (session_id, puuid, user_id, status, paid_at, expires_at)
         VALUES ($1, $2, $3, 'paid', NOW(), $4)
         ON CONFLICT (session_id) DO UPDATE
         SET status = 'paid', paid_at = NOW(), expires_at = $4, user_id = COALESCE($3, ai_analysis_payments.user_id)`,
        [session.id, puuid, userId ?? null, expiresAt],
      );

      console.log(`[Stripe Webhook] Płatność potwierdzona: session=${session.id} puuid=${puuid} user=${userId ?? "brak"}`);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      await pool.query(
        `UPDATE ai_analysis_payments SET status = 'expired' WHERE session_id = $1 AND status = 'pending'`,
        [session.id],
      );
      console.log(`[Stripe Webhook] Sesja wygasła: ${session.id}`);
    }
  }
}
