import * as webpush from "web-push";
import { db } from "@/lib/prisma";

type NotificationData = {
  title: string;
  body: string;
  url?: string;
};

export async function sendAdminPushNotification(
  notification: NotificationData
) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      console.error("Push notification environment variables are missing.");
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const subscriptions =
      await db.orm.public.AdminPushSubscription.all();

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || "/admin",
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload
          );
        } catch (error) {
          console.error("Admin push delivery failed:", error);
        }
      })
    );
  } catch (error) {
    console.error("Admin push notification error:", error);
  }
}