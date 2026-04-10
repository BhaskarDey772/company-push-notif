export interface InitOptions {
  /** Firebase project config object (from Firebase Console → Project Settings → Your apps) */
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  /** VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates */
  vapidKey: string;
  /**
   * Path to the service worker file.
   * @default '/firebase-messaging-sw.js'
   */
  serviceWorkerPath?: string;
}

export interface IncomingNotification {
  title: string;
  body: string;
  /** Large image URL, if provided by the sender */
  imageUrl: string;
  /** Custom key-value pairs sent by the backend via `data` field */
  data: Record<string, string>;
  /** Full raw FCM payload — for advanced use cases */
  raw: unknown;
}

/**
 * Initialize the notification helper.
 * Call once at app startup before using any other functions.
 */
export function init(options: InitOptions): Promise<void>;

/**
 * Request notification permission from the user and return the FCM device token.
 * Returns `null` if the user denies permission.
 */
export function requestPermission(): Promise<string | null>;

/**
 * Get the current FCM token without re-prompting the user.
 * Returns `null` if permission has not been granted yet.
 */
export function getDeviceToken(): Promise<string | null>;

/**
 * Returns the current browser notification permission state.
 */
export function getPermissionState(): 'granted' | 'denied' | 'default';

/**
 * Listen for messages while the app tab is open (foreground).
 *
 * @param handler - Called with a normalized notification object on each message
 * @returns Unsubscribe function — call it when the component/page unmounts
 *
 * @example
 * const unsubscribe = onForegroundMessage(({ title, body }) => {
 *   showToast(title, body);
 * });
 * // later: unsubscribe();
 */
export function onForegroundMessage(
  handler: (notification: IncomingNotification) => void
): () => void;

/**
 * Delete the current FCM token.
 * Call this on user logout or when the user opts out of notifications.
 * The next `requestPermission()` call will generate a fresh token.
 */
export function deleteToken(): Promise<boolean>;
