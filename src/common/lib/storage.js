const KEY = "ee_access_token";
const tokenStore = {
  get() {
    return localStorage.getItem(KEY);
  },
  set(token) {
    localStorage.setItem(KEY, token);
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
export {
  tokenStore
};
