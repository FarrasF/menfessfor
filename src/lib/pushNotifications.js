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
    alert(
        'DEBUG 1\n' +
        'Standalone: ' +
        window.matchMedia('(display-mode: standalone)').matches +
        '\nFullscreen: ' +
        window.matchMedia('(display-mode: fullscreen)').matches +
        '\niOS: ' +
        /iPhone|iPad|iPod/i.test(navigator.userAgent) +
        '\nNotification: ' +
        typeof Notification +
        '\nPushManager: ' +
        typeof PushManager +
        '\nServiceWorker: ' +
        ('serviceWorker' in navigator)
    );

    if (!('serviceWorker' in navigator)) {
        throw new Error('Browser tidak mendukung Service Worker.');
    }

    if (!('PushManager' in window)) {
        throw new Error('Browser tidak mendukung Push Notification.');
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    alert(
        'DEBUG 2\n' +
        'VAPID key ada: ' +
        !!vapidKey +
        '\nPanjang key: ' +
        (vapidKey ? vapidKey.length : 'undefined')
    );

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
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
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