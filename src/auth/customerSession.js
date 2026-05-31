import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import { auth } from "./firebase";
import { getAuthToken, getAuthUser } from "./firebaseAuth";

export function getStoreCustomerSession(storeSlug) {
  if (!storeSlug) return { token: null, customer: null };
  try {
    const token = localStorage.getItem(`store_customer_token_${storeSlug}`);
    const rawCustomer = localStorage.getItem(`store_customer_${storeSlug}`);
    return {
      token,
      customer: rawCustomer ? JSON.parse(rawCustomer) : null,
    };
  } catch {
    return { token: null, customer: null };
  }
}

export async function ensureStoreCustomerSession(storeSlug, preferredIdToken = null) {
  if (!storeSlug) return getStoreCustomerSession(storeSlug);

  const existing = getStoreCustomerSession(storeSlug);
  if (existing.token) return existing;

  const authUser = getAuthUser();
  if (!authUser) return existing;

  let idToken = preferredIdToken || getAuthToken();

  if (!idToken && auth.currentUser) {
    idToken = await auth.currentUser.getIdToken();
  }

  if (!idToken) return existing;

  async function sync(tokenToUse) {
    const { data } = await axios.post(
      `${API_BASE_URL}/store/${storeSlug}/auth/google`,
      { idToken: tokenToUse }
    );

    if (data?.token) {
      localStorage.setItem(`store_customer_token_${storeSlug}`, data.token);
      localStorage.setItem(`store_customer_${storeSlug}`, JSON.stringify(data.customer || null));
      window.dispatchEvent(new Event("customer-auth-changed"));
    }

    return getStoreCustomerSession(storeSlug);
  }

  try {
    return await sync(idToken);
  } catch (err) {
    if (!auth.currentUser) throw err;
    const fresh = await auth.currentUser.getIdToken(true);
    localStorage.setItem("illolam_auth_token", fresh);
    return await sync(fresh);
  }
}
