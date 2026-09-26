import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
        });
    }

    try {
        const { title, body, url } = req.body;

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('id, endpoint, p256dh, auth');

        if (error) {
            throw error;
        }

        const results = [];

        for (const subscription of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    },
                    JSON.stringify({
                        title: title || 'Menfessfor',
                        body: body || 'Ada notifikasi baru.',
                        url: url || '/admin',
                    })
                );

                results.push({
                    success: true,
                    id: subscription.id,
                });

            } catch (error) {
                if (error.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', subscription.id);
                }

                results.push({
                    success: false,
                    id: subscription.id,
                    error: error.message,
                });
            }
        }

        return res.status(200).json({
            success: true,
            sent: results.filter(
                (result) => result.success === true
            ).length,
            failed: results.filter(
                (result) => result.success === false
            ).length,
        });

    } catch (error) {
        console.error('Push notification error:', error);

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}