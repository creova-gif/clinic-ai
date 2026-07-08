import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'AFYACARE_SECURE_STORAGE_KEY_V1';

export const SecureStorage = {
  /**
   * Encrypt and store data in localStorage
   * @param key Storage key
   * @param value Data to store
   */
  setItem(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      const encryptedValue = CryptoJS.AES.encrypt(jsonValue, ENCRYPTION_KEY).toString();
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Error securely saving to localStorage for key: ${key}`, error);
    }
  },

  /**
   * Retrieve and decrypt data from localStorage
   * @param key Storage key
   * @returns The decrypted data or null if not found
   */
  getItem<T>(key: string): T | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) return null;

      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.error(`Error securely reading from localStorage for key: ${key}`, error);
      return null;
    }
  },

  /**
   * Remove item from localStorage
   * @param key Storage key
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    localStorage.clear();
  }
};
