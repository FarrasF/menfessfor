import { supabase } from './supabase';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush() {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Browser tidak mendukung Service Worker.');
    }

    if (!('PushManager' in window)) {
        throw new Error('Browser tidak mendukung Push Notification.');
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('Izin notifikasi ditolak.');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');

    await navigator.serviceWorker.ready;

    const existingSubscription =
        await registration.pushManager.getSubscription();

    const subscription =
        existingSubscription ||
        await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                import.meta.env.VITE_VAPID_PUBLIC_KEY
            ),
        });

    const subscriptionJSON = subscription.toJSON();

    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('User belum login.');
    }

    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            user_id: user.id,
            endpoint: subscriptionJSON.endpoint,
            p256dh: subscriptionJSON.keys.p256dh,
            auth: subscriptionJSON.keys.auth,
        }, {
            onConflict: 'endpoint',
        });

    if (error) {
        throw error;
    }

    return subscription;
}