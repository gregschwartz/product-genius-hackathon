// @flow

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string | number | boolean) {
    try {
      window.localStorage.setItem(key, value);
    // eslint-disable-next-line no-empty
    } catch {}
  },

  removeItem(key: string) {
    try {
      window.localStorage.removeItem(key);
    // eslint-disable-next-line no-empty
    } catch {}
  },
};

export default safeLocalStorage;
