import express from 'express';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(express.json());

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

app.post('/api/send-notification', async (req, res) => {
    console.log('=== ENDPOINT DIPANGGIL ===');
    try {
        const { title, body, url } = req.body;

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('id, endpoint, p256dh, auth');

        console.log('JUMLAH SUBSCRIPTION:', subscriptions?.length);

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

                console.log('PUSH BERHASIL:', subscription.id);

                results.push({
                    success: true,
                    id: subscription.id,
                });
            } catch (error) {
                console.error('================================');

                if (error.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', subscription.id);

                    console.log('SUBSCRIPTION DIHAPUS:', subscription.id);
                }

                results.push({
                    success: false,
                    id: subscription.id,
                    error: error.message,
                });
            }
        }

        return res.json({
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
});

app.listen(PORT, () => {
    console.log(`Push server berjalan di http://localhost:${PORT}`);
});