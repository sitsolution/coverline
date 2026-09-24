/**
 * Web Push subscription management for the Coverline admin panel.
 *
 * Flow:
 *  1. After login, call subscribeWebPush().
 *  2. Browser shows a "Allow notifications?" prompt (once per origin).
 *  3. On approval the browser creates a PushSubscription and we POST it to
 *     the backend (/users/me/web-push-subscription).
 *  4. The backend uses pywebpush + VAPID to send pushes whenever notify() fires.
 *  5. The service worker (public/sw.js) displays the notification in the background.
 *
 * TODO: Set VAPID_PUBLIC_KEY once the client provides it.
 * Generate VAPID keys:  pip install pywebpush && python -c "from py_vapid import Vapid; v=Vapid(); v.generate_keys(); print('PRIVATE:', v.private_key_str); print('PUBLIC:', v.public_key_str)"
 */

import api from './api';

// TODO: replace with the real VAPID public key from your backend .env
const VAPID_PUBLIC_KEY = 'BGC7dWm6U5Vp2xywQFmJMQ2MARp3sQ4tj3Cxd_zQpqfwmPze9T1WWV4AZEI1Uot7A0sllfcxY-OIPXIwhD4st3M';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function sendSubscriptionToBackend(sub: PushSubscription): Promise<void> {
  const p256dhBuffer = sub.getKey('p256dh');
  const authBuffer = sub.getKey('auth');

  await api.post('/users/me/web-push-subscription', {
    endpoint: sub.endpoint,
    p256dhKey: p256dhBuffer ? arrayBufferToBase64(p256dhBuffer) : '',
    authKey: authBuffer ? arrayBufferToBase64(authBuffer) : '',
  });
}

export async function subscribeWebPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // If already subscribed just re-sync the endpoint with the backend
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await sendSubscriptionToBackend(existing);
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToBackend(subscription);
  } catch (err) {
    // Permission denied or SW registration failed — non-fatal
    console.warn('[WebPush] Subscription failed:', err);
  }
}

export async function unsubscribeWebPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await api.delete('/users/me/web-push-subscription', {
      data: { endpoint: subscription.endpoint },
    });

    await subscription.unsubscribe();
  } catch (err) {
    console.warn('[WebPush] Unsubscribe failed:', err);
  }
}
