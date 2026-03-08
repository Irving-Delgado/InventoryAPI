import {Request, Response} from "express";
import {stripe} from "../../lib/stripe"; 
import { itemsService } from "../items/items.service";

export const paymentController = {
    async createCheckoutSession(req: Request, res: Response) {
        try {
            const { itemId, purchaseQuantity } = req.body;

            if (!itemId || !purchaseQuantity || purchaseQuantity <= 0) {
                return res.status(400).json({
                    error: "itemId and valid purchaseQuantity are required",
                });
            }

            const item = await itemsService.getById(itemId);

            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }

            if (!item.isActive) {
                return res.status(400).json({ error: "Item is not active" });
            }

            if (purchaseQuantity > item.quantity) {
                return res.status(400).json({ error: "Not enough stock available" });
            }

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name,
                            description: item.description ?? undefined,
                        },
                        unit_amount: Math.round(item.price * 100), // Convert to cents
                    },
                    quantity: purchaseQuantity,
                }],
                success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                metadata: {
                    itemId: item.id,
                    purchaseQuantity: purchaseQuantity.toString(),
                }
            })
            return res.status(200).json({ url: session.url });
        } catch (e: any) {
            res.status(500).send({ error: e.message });
        }
    },
    async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
        if(!signature || !webhookSecret) {
            return res.status(400).send('Missing signature');
        }
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                
                const itemId = session.metadata?.itemId;
                const purchaseQuantity = Number(session.metadata?.purchaseQuantity ?? 1);

                if (!itemId) {
                    return res.status(400).json({ error: "missing itemId in metadata" });
                }
                if (!Number.isInteger(purchaseQuantity) || purchaseQuantity <= 0) {
                    return res.status(400).json({ error: "invalid purchaseQuantity in metadata" });
                }

                await itemsService.sellMany(itemId, purchaseQuantity);
            }

            return res.json({ received: true });
        }catch (e: any) {
            return res.status(400).send(`Webhook Error: ${e.message}`);
        }
    }
}