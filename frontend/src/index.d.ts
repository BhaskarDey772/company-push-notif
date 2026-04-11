export interface InitOptions {
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  vapidKey: string;
  /** @default '/firebase-messaging-sw.js' */
  serviceWorkerPath?: string;
}

export interface IncomingNotification {
  title: string;
  body: string;
  imageUrl: string;
  data: Record<string, string>;
  raw: unknown;
}

export function init(options: InitOptions): Promise<void>;
export function requestPermission(): Promise<string | null>;
export function getDeviceToken(): Promise<string | null>;
export function getPermissionState(): 'granted' | 'denied' | 'default';
export function onForegroundMessage(
  handler: (notification: IncomingNotification) => void
): () => void;
export function deleteToken(): Promise<boolean>;
