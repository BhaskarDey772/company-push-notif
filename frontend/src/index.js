/**
 * @bhaskardey772/push-notif-frontend
 *
 * Frontend helper for Firebase Cloud Messaging.
 * Developers bring their own Firebase config and VAPID key — this package
 * handles permission, token retrieval, and message listeners.
 *
 * Usage:
 *   import * as notif from '@bhaskardey772/push-notif-frontend';
 *
 *   await notif.init({
 *     firebaseConfig: { apiKey: '...', projectId: '...', ... },
 *     vapidKey: 'BPsxVg...',
 *     serviceWorkerPath: '/firebase-messaging-sw.js', // optional, this is the default
 *   });
 *
 *   const token = await notif.requestPermission();  // asks user + returns FCM token
 *
 *   notif.onForegroundMessage(({ title, body, data }) => {
 *     showToast(title, body);
 *   });
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, deleteToken as fbDeleteToken } from 'firebase/messaging';

let _messaging = null;
let _vapidKey = null;
let _swRegistration = null;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialize the notification helper.
 * Call this once (e.g. in your app's entry point).
 *
 * @param {InitOptions} options
 * @returns {Promise<void>}
 */
export async function init({ firebaseConfig, vapidKey, serviceWorkerPath = '/firebase-messaging-sw.js' }) {
  if (!firebaseConfig) throw new Error('[@bhaskardey772/push-notif-frontend] firebaseConfig is required');
  if (!vapidKey) throw new Error('[@bhaskardey772/push-notif-frontend] vapidKey is required');

  const supported = await isSupported();
  if (!supported) {
    console.warn('[@bhaskardey772/push-notif-frontend] Firebase Messaging is not supported in this browser.');
    return;
  }

  // Reuse existing Firebase app if already initialized
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _messaging = getMessaging(app);
  _vapidKey = vapidKey;

  // Register the service worker once
  if ('serviceWorker' in navigator) {
    try {
      _swRegistration = await navigator.serviceWorker.register(serviceWorkerPath);
    } catch (err) {
      console.error('[@bhaskardey772/push-notif-frontend] Service worker registration failed:', err);
      throw err;
    }
  } else {
    throw new Error('[@bhaskardey772/push-notif-frontend] Service workers are not supported in this browser.');
  }
}

/**
 * Request notification permission from the user and return the FCM token.
 * Returns null if the user denies permission.
 *
 * @returns {Promise<string|null>} FCM registration token, or null if denied
 */
export async function requestPermission() {
  assertInit();

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    console.warn('[@bhaskardey772/push-notif-frontend] Notification permission denied.');
    return null;
  }

  return _getToken();
}

/**
 * Get the current FCM token without prompting for permission.
 * Returns null if permission was not already granted.
 *
 * @returns {Promise<string|null>}
 */
export async function getDeviceToken() {
  assertInit();

  if (Notification.permission !== 'granted') {
    return null;
  }

  return _getToken();
}

/**
 * Returns the current notification permission state.
 * @returns {'granted'|'denied'|'default'}
 */
export function getPermissionState() {
  return Notification.permission;
}

/**
 * Listen for messages when the app is in the foreground.
 * The handler receives a normalized notification object.
 *
 * @param {(notification: IncomingNotification) => void} handler
 * @returns {() => void} Unsubscribe function
 */
export function onForegroundMessage(handler) {
  assertInit();

  const unsubscribe = onMessage(_messaging, (payload) => {
    handler(normalizePayload(payload));
  });

  return unsubscribe;
}

/**
 * Delete the current FCM token (e.g. when user logs out or opts out).
 * After calling this, requestPermission() will generate a new token.
 *
 * @returns {Promise<boolean>} true if deleted successfully
 */
export async function deleteToken() {
  assertInit();
  return fbDeleteToken(_messaging);
}

// ─── Internals ───────────────────────────────────────────────────────────────

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

/**
 * Normalize a raw FCM payload into a consistent shape.
 * @param {object} payload - Raw FCM message payload
 * @returns {IncomingNotification}
 */
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

/**
 * @typedef {object} InitOptions
 * @property {object} firebaseConfig      - Firebase project config object
 * @property {string} vapidKey            - VAPID key from Firebase Console → Project Settings → Cloud Messaging
 * @property {string} [serviceWorkerPath] - Path to service worker file (default: '/firebase-messaging-sw.js')
 *
 * @typedef {object} IncomingNotification
 * @property {string} title
 * @property {string} body
 * @property {string} imageUrl
 * @property {object} data    - Custom key-value pairs from the sender
 * @property {object} raw     - Full raw FCM payload (for advanced use)
 */
