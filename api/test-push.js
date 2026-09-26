import dotenv from 'dotenv';

dotenv.config({
    path: '../.env.local',
});

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

const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth');

if (error) {
    throw error;
}

console.log(`Menemukan ${subscriptions.length} subscription.`);

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
                title: 'Test Menfessfor',
                body: 'Notif test berhasil masuk!',
                url: '/admin',
            })
        );

        console.log(`✅ Berhasil dikirim: ${subscription.id}`);
    } catch (error) {
        console.log(`❌ Gagal: ${subscription.id}`);
        console.log(error.message);
    }
}