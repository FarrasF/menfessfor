self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const title = data.title || 'Menfessfor';
    const options = {
        body: data.body || 'Ada notifikasi baru.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
            url: data.url || '/admin',
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/admin';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});