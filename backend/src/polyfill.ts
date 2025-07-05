import { webcrypto } from 'node:crypto';

// Polyfill for crypto.randomUUID
if (!global.crypto) {
  global.crypto = webcrypto as Crypto;
}
