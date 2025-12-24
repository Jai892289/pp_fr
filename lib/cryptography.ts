import Hashids from 'hashids';
import { enc, AES, mode, pad, lib } from 'crypto-js';

const hashids = new Hashids(process.env.NEXT_PUBLIC_SALT, 10);

export const encrypt = (id: number): string => {
    return hashids.encode(id);
}

export const decrypt = (id: string): number | null => {
    const decoded = hashids.decode(id);
    return decoded.length > 0 ? Number(decoded[0]) : null;
}


export const apiEncrypt = (data: unknown): { iv: string; encryptedData: string } => {
    const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY!;
    const key = enc.Hex.parse(ENCRYPTION_KEY);
    const iv = lib.WordArray.random(16);
  
    const jsonData = JSON.stringify(data);
  
    const encrypted = AES.encrypt(jsonData, key, {
      iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });
  
    return {
      iv: iv.toString(enc.Hex),
      encryptedData: enc.Hex.stringify(enc.Base64.parse(encrypted.toString())),
    };
  };

export const apiDecrypt = (data: { encryptedData: string; iv: string }): unknown => {
    const { encryptedData, iv } = data;

    const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY!;
    const key = enc.Hex.parse(ENCRYPTION_KEY);
    const ivBytes = enc.Hex.parse(iv);

    const encryptedHexStr = enc.Hex.parse(encryptedData);
    const encryptedBase64Str = enc.Base64.stringify(encryptedHexStr)

    const decrypted = AES.decrypt(encryptedBase64Str, key, {
        iv: ivBytes,
        mode: mode.CBC,
        padding: pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(enc.Utf8);

    if (!decryptedText) {
        throw new Error('Decryption failed or returned empty');
    }

    return JSON.parse(decryptedText);
};