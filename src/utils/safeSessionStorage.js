// @flow

const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string | number | boolean) {
    try {
      window.sessionStorage.setItem(key, value);
    // eslint-disable-next-line no-empty
    } catch {}
  },

  removeItem(key: string) {
    try {
      window.sessionStorage.removeItem(key);
    // eslint-disable-next-line no-empty
    } catch {}
  },
};

export default safeSessionStorage;
