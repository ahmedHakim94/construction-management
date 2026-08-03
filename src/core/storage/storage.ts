export function getStorageItem(key: string) {
  return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
}

export function setStorageItem(key: string, value: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
}

export function removeStorageItem(key: string) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}
