const DB_NAME = 'ft-auth';
const STORE_NAME = 'keys';
const KEY_ID = 'session';
const STORAGE_KEY = 'ft_session';

let keyPromise = null;

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const idbGet = (db, key) =>
  new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });

const idbPut = (db, key, value) =>
  new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

const loadOrCreateKey = async () => {
  const db = await openDb();
  const existing = await idbGet(db, KEY_ID);
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  await idbPut(db, KEY_ID, key);
  return key;
};

const getKey = () => {
  if (!keyPromise) {
    keyPromise = loadOrCreateKey().catch((error) => {
      keyPromise = null;
      throw error;
    });
  }
  return keyPromise;
};

const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

export const hasStoredToken = () => {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
};

export const saveToken = async (token) => {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(token),
    ),
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(ciphertext),
    }),
  );
};

export const readToken = async () => {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw);
    if (!stored?.iv || !stored?.ciphertext) {
      throw new Error('Stored session is incomplete');
    }

    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(stored.iv) },
      await getKey(),
      base64ToBytes(stored.ciphertext),
    );
    return new TextDecoder().decode(plain);
  } catch {
    clearToken();
    return null;
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private modes; the in-memory session still ends.
  }
};
