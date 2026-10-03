import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api, MobileApiError } from "@/api/client";
import type { MeResponse } from "@/api/types";
const TOKEN_KEY = "toeicgym.mobile.session.v1";
type AuthState = { loading: boolean; token: string | null; me: MeResponse["data"] | null; signIn(email: string, password: string): Promise<void>; signOut(): Promise<void>; refreshMe(): Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true); const [token, setToken] = useState<string | null>(null); const [me, setMe] = useState<MeResponse["data"] | null>(null);
  const clear = useCallback(async () => { await SecureStore.deleteItemAsync(TOKEN_KEY); setToken(null); setMe(null); }, []);
  const loadMe = useCallback(async (value: string) => { try { const response = await api.me(value); setMe(response.data); setToken(value); } catch (error) { if (error instanceof MobileApiError && error.code === "UNAUTHENTICATED") await clear(); else throw error; } }, [clear]);
  useEffect(() => { void (async () => { try { const stored = await SecureStore.getItemAsync(TOKEN_KEY); if (stored) { setToken(stored); await loadMe(stored); } } catch { /* Keep a securely stored token during temporary offline startup. */ } finally { setLoading(false); } })(); }, [loadMe]);
  const value = useMemo<AuthState>(() => ({ loading, token, me, async signIn(email, password) { const response = await api.login(email, password); await SecureStore.setItemAsync(TOKEN_KEY, response.data.token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); await loadMe(response.data.token); router.replace("/(tabs)"); }, async signOut() { if (token) try { await api.logout(token); } catch { /* clear local secret even when offline */ } await clear(); router.replace("/sign-in"); }, async refreshMe() { if (token) await loadMe(token); } }), [clear, loadMe, loading, me, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider is missing"); return value; }
