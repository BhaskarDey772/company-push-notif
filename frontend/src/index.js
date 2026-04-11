import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, deleteToken as fbDeleteToken } from 'firebase/messaging';

let _messaging = null;
let _vapidKey = null;
let _swRegistration = null;

export async function init({ firebaseConfig, vapidKey, serviceWorkerPath = '/firebase-messaging-sw.js' }) {
  if (!firebaseConfig) throw new Error('[@bhaskardey772/push-notif-frontend] firebaseConfig is required');
  if (!vapidKey) throw new Error('[@bhaskardey772/push-notif-frontend] vapidKey is required');

  const supported = await isSupported();
  if (!supported) {
    console.warn('[@bhaskardey772/push-notif-frontend] Firebase Messaging is not supported in this browser.');
    return;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _messaging = getMessaging(app);
  _vapidKey = vapidKey;

  if (!('serviceWorker' in navigator)) {
    throw new Error('[@bhaskardey772/push-notif-frontend] Service workers are not supported in this browser.');
  }

  try {
    _swRegistration = await navigator.serviceWorker.register(serviceWorkerPath);

    const sw = _swRegistration.installing || _swRegistration.waiting || _swRegistration.active;
    if (sw && sw.state !== 'activated') {
      await new Promise((resolve) => {
        sw.addEventListener('statechange', function handler(e) {
          if (e.target.state === 'activated') {
            sw.removeEventListener('statechange', handler);
            resolve();
          }
        });
      });
    }

    const activeSW = _swRegistration.active;
    if (activeSW) {
      activeSW.postMessage({ type: 'FIREBASE_CONFIG', firebaseConfig });
    }
  } catch (err) {
    console.error('[@bhaskardey772/push-notif-frontend] Service worker registration failed:', err);
    throw err;
  }
}

export async function requestPermission() {
  assertInit();
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[@bhaskardey772/push-notif-frontend] Notification permission denied.');
    return null;
  }
  return _getToken();
}

export async function getDeviceToken() {
  assertInit();
  if (Notification.permission !== 'granted') return null;
  return _getToken();
}

export function getPermissionState() {
  return Notification.permission;
}

export function onForegroundMessage(handler) {
  assertInit();
  return onMessage(_messaging, (payload) => handler(normalizePayload(payload)));
}

export async function deleteToken() {
  assertInit();
  return fbDeleteToken(_messaging);
}

function assertInit() {
  if (!_messaging) {
    throw new Error(
      '[@bhaskardey772/push-notif-frontend] Call notif.init({ firebaseConfig, vapidKey }) before using other methods.'
    );
  }
}

async function _getToken() {
  try {
    const token = await getToken(_messaging, {
      vapidKey: _vapidKey,
      serviceWorkerRegistration: _swRegistration,
    });
    return token || null;
  } catch (err) {
    console.error('[@bhaskardey772/push-notif-frontend] Failed to get FCM token:', err);
    throw err;
  }
}

function normalizePayload(payload) {
  const n = payload.notification || {};
  return {
    title: n.title || '',
    body: n.body || '',
    imageUrl: n.image || '',
    data: payload.data || {},
    raw: payload,
  };
}
