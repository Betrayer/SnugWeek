export type LockMethod = "pin" | "passkey";

interface PinSecret {
  method: "pin";
  salt: string;
  hash: string;
}

interface PasskeySecret {
  method: "passkey";
  credentialId: string;
}

type LockSecret = PinSecret | PasskeySecret;

const LOCK_KEY = "snugweek-lock";

export const PIN_LENGTH = 4;

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const randomBytes = (length: number): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(new ArrayBuffer(length));
  crypto.getRandomValues(bytes);
  return bytes;
};

const hashPin = async (salt: string, pin: string): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
};

const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const binary = Array.from(new Uint8Array(buffer), (byte) =>
    String.fromCharCode(byte),
  ).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const base64urlToBytes = (value: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const readSecret = (): LockSecret | null => {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (
      obj.method === "pin" &&
      typeof obj.salt === "string" &&
      typeof obj.hash === "string"
    ) {
      return { method: "pin", salt: obj.salt, hash: obj.hash };
    }
    if (obj.method === "passkey" && typeof obj.credentialId === "string") {
      return { method: "passkey", credentialId: obj.credentialId };
    }
    return null;
  } catch {
    return null;
  }
};

const writeSecret = (secret: LockSecret): void => {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(secret));
  } catch (error) {
    console.error(error);
  }
};

export const clearLockSecret = (): void => {
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch (error) {
    console.error(error);
  }
};

export const lockConfigured = (): boolean => readSecret() !== null;

export const configuredMethod = (): LockMethod | null =>
  readSecret()?.method ?? null;

export const setPin = async (pin: string): Promise<void> => {
  const salt = bytesToHex(randomBytes(16));
  const hash = await hashPin(salt, pin);
  writeSecret({ method: "pin", salt, hash });
};

export const verifyPin = async (pin: string): Promise<boolean> => {
  const secret = readSecret();
  if (!secret || secret.method !== "pin") return false;
  const hash = await hashPin(secret.salt, pin);
  return hash === secret.hash;
};

export const passkeySupported = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.PublicKeyCredential !== "undefined" &&
  typeof navigator.credentials?.create === "function";

export const registerPasskey = async (label: string): Promise<boolean> => {
  if (!passkeySupported()) return false;
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: "SnugWeek", id: location.hostname },
      user: {
        id: randomBytes(16),
        name: label.length > 0 ? label : "SnugWeek",
        displayName: "SnugWeek",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { userVerification: "required" },
      timeout: 60000,
    },
  });
  if (!credential) return false;
  writeSecret({
    method: "passkey",
    credentialId: bufferToBase64url((credential as PublicKeyCredential).rawId),
  });
  return true;
};

export const verifyPasskey = async (): Promise<boolean> => {
  const secret = readSecret();
  if (!secret || secret.method !== "passkey" || !passkeySupported()) {
    return false;
  }
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [
        { type: "public-key", id: base64urlToBytes(secret.credentialId) },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  });
  return assertion !== null;
};
