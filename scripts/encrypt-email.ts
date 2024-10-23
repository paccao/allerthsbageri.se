#!/usr/bin/env node

import { base64 } from 'rfc4648'
import { webcrypto } from 'crypto'

/**
 * Encrypt a string and turn it into an encrypted payload.
 *
 * @param {string} content The data to encrypt
 * @param {string} password The password which will be used to encrypt + decrypt
 *   the content.
 * @returns An encrypted payload
 */
export async function getEncryptedPayload(content: string, password: string) {
  const encoder = new TextEncoder()
  const salt = webcrypto.getRandomValues(new Uint8Array(32))
  const baseKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 2e5, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )

  const iv = webcrypto.getRandomValues(new Uint8Array(16))
  const ciphertext = new Uint8Array(
    await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(content),
    ),
  )
  const totalLength = salt.length + iv.length + ciphertext.length
  const mergedData = new Uint8Array(totalLength)
  mergedData.set(salt)
  mergedData.set(iv, salt.length)
  mergedData.set(ciphertext, salt.length + iv.length)

  return base64.stringify(mergedData)
}

const text = process.env.EMAIL
const pwd = process.env.PUBLIC_PASSWORD

if (!text || !pwd) throw new Error('Missing env variable')

const pl = await getEncryptedPayload(text, pwd)

console.log(pl)
