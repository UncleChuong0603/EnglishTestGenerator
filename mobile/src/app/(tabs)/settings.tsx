import { useCallback, useState } from "react";
import { router, useFocusEffect, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { EntitlementsResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

export default function SettingsTab() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [plan, setPlan] = useState<EntitlementsResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingLanguage, setSavingLanguage] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try {
      setPlan((await api.entitlements(auth.token)).data);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải trạng thái gói." : "Could not load plan status."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const expiry = plan?.premiumExpiresAt
    ? new Date(plan.premiumExpiresAt).toLocaleDateString(vi ? "vi-VN" : "en-US")
    : null;

  async function setInterfaceLanguage(interfaceLanguage: "vi" | "en") {
    if (!auth.token || !auth.me || auth.me.profile.interfaceLanguage === interfaceLanguage) return;
    setSavingLanguage(true); setError(null);
    try {
      await api.updatePreferences(auth.token, { interfaceLanguage, explanationLanguage: auth.me.profile.explanationLanguage });
      await auth.refreshMe();
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể đổi ngôn ngữ." : "Could not update language."));
    } finally { setSavingLanguage(false); }
  }

  return (
    <Screen>
      <Title>{vi ? "Cài đặt" : "Settings"}</Title>
      {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
      <Card>
        <Text style={styles.title}>{auth.me?.profile.displayName ?? auth.me?.email}</Text>
        <Muted>{auth.me?.email}</Muted>
        <Muted>{vi ? "Ngôn ngữ" : "Interface"}: {auth.me?.profile.interfaceLanguage === "en" ? "English" : "Tiếng Việt"} · {vi ? "Giải thích" : "Explanations"}: {auth.me?.profile.explanationLanguage.toUpperCase()}</Muted>
        <View style={styles.actions}><View style={styles.action}><PrimaryButton busy={savingLanguage} disabled={savingLanguage || auth.me?.profile.interfaceLanguage === "vi"} label="Tiếng Việt" onPress={() => void setInterfaceLanguage("vi")} /></View><View style={styles.action}><PrimaryButton busy={savingLanguage} disabled={savingLanguage || auth.me?.profile.interfaceLanguage === "en"} label="English" onPress={() => void setInterfaceLanguage("en")} /></View></View>
      </Card>
      <Card>
        <Text style={styles.title}>{vi ? "Gói hiện tại" : "Current plan"}</Text>
        <Muted>{plan
          ? `${plan.effectivePlan}${plan.isTrial ? (vi ? " · Dùng thử" : " · Trial") : ""}${expiry ? (vi ? ` · Hết hạn ${expiry}` : ` · Expires ${expiry}`) : ""}`
          : (vi ? "Đang tải trạng thái gói…" : "Loading plan status…")}</Muted>
      </Card>
      <Card>
        <Text style={styles.title}>{vi ? "Tài khoản & dữ liệu" : "Account & data"}</Text>
        <Muted>{vi ? "Bạn có thể xuất hoặc xóa dữ liệu trong trang bảo mật trên web. Xóa tài khoản sẽ vô hiệu hóa ngay phiên mobile này." : "Export or delete your data on the secure web page. Deleting the account immediately invalidates this mobile session."}</Muted>
        <PrimaryButton label={vi ? "Mở Tài khoản & dữ liệu" : "Open Account & data"} onPress={() => router.push("/account-data" as Href)} />
      </Card>
      <Card>
        <Text style={styles.title}>{vi ? "Đăng nhập Google" : "Google sign-in"}</Text>
        <Muted>{vi ? "Đang tạm hoãn đến khi backend có PKCE exchange dành riêng cho native. Không dùng WebView hoặc cookie scraping." : "Deferred until the backend has a native PKCE exchange. The app does not use WebView or browser-cookie scraping."}</Muted>
      </Card>
      <PrimaryButton label={vi ? "Đăng xuất" : "Sign out"} onPress={() => void auth.signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 19, fontWeight: "800" }, actions: { flexDirection: "row", gap: 8 }, action: { flex: 1 } });
