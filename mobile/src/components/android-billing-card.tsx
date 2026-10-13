import { useCallback, useEffect, useMemo, useState } from "react";
import {
  finishTransaction,
  getAvailablePurchases,
  isUserCancelledError,
  useIAP,
  type ProductSubscription,
  type Purchase,
} from "expo-iap";
import { StyleSheet, Text, View } from "react-native";
import { api } from "@/api/client";
import type { StoreBillingConfigResponse } from "@/api/types";
import { Card, ErrorBanner, Muted, PrimaryButton } from "@/components/ui";
import { colors, space } from "@/theme";

type Props = {
  token: string;
  vi: boolean;
  onEntitlementChange(): void | Promise<void>;
};

function purchaseKey(purchase: Purchase, mode: "PURCHASE" | "RESTORE") {
  const reference = purchase.transactionId ?? purchase.id;
  return `play-${mode.toLowerCase()}-${reference}`.replace(/[^A-Za-z0-9._:-]/g, "-").slice(0, 128);
}

export function AndroidBillingCard({ token, vi, onEntitlementChange }: Props) {
  const [config, setConfig] = useState<StoreBillingConfigResponse["data"]["google"] | null>(null);
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (purchase: Purchase, mode: "PURCHASE" | "RESTORE") => {
    if (purchase.purchaseState === "pending") {
      setMessage(vi ? "Google Play đang xử lý giao dịch. Quyền Premium sẽ chỉ mở sau khi thanh toán được xác nhận." : "Google Play is processing the transaction. Premium unlocks only after payment is confirmed.");
      return false;
    }
    const purchaseToken = purchase.purchaseToken;
    if (!purchaseToken) throw new Error(vi ? "Google Play không trả về mã giao dịch hợp lệ." : "Google Play did not return a valid purchase token.");
    await api.verifyStorePurchase(token, { platform: "android", mode, purchaseToken }, purchaseKey(purchase, mode));
    await finishTransaction({ purchase, isConsumable: false });
    await onEntitlementChange();
    return true;
  }, [onEntitlementChange, token, vi]);

  const iap = useIAP({
    onPurchaseSuccess: (purchase) => {
      setBusyProduct(purchase.productId);
      setError(null);
      void verify(purchase, "PURCHASE")
        .then((verified) => { if (verified) setMessage(vi ? "Đã xác minh giao dịch. Premium đã được cập nhật." : "Purchase verified. Premium is now updated."); })
        .catch((cause) => setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể xác minh giao dịch." : "Could not verify the purchase.")))
        .finally(() => setBusyProduct(null));
    },
    onPurchaseError: (cause) => {
      setBusyProduct(null);
      if (!isUserCancelledError(cause)) setError(cause.message);
    },
    onError: (cause) => setError(cause.message),
  });
  const { connected, fetchProducts, requestPurchase, subscriptions } = iap;

  const loadProducts = useCallback(async () => {
    const response = await api.storeBillingConfig(token);
    setConfig(response.data.google);
    if (response.data.google.available && connected)
      await fetchProducts({ skus: response.data.google.productIds, type: "subs" });
  }, [connected, fetchProducts, token]);

  useEffect(() => {
    let active = true;
    const task = setTimeout(() => {
      void loadProducts().catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải sản phẩm Google Play." : "Could not load Google Play products."));
      });
    }, 0);
    return () => { active = false; clearTimeout(task); };
  }, [loadProducts, vi]);

  const products = useMemo(() => subscriptions.filter((product) => config?.productIds.includes(product.id)), [config, subscriptions]);

  async function purchase(product: ProductSubscription) {
    const offerToken = product.platform === "android"
      ? product.subscriptionOffers.find((offer) => offer.offerTokenAndroid)?.offerTokenAndroid
      : null;
    if (!offerToken) {
      setError(vi ? "Sản phẩm này chưa có base plan đang hoạt động trên Google Play." : "This product has no active Google Play base plan.");
      return;
    }
    setBusyProduct(product.id); setMessage(null); setError(null);
    try {
      await requestPurchase({
        type: "subs",
        request: { google: {
          skus: [product.id],
          obfuscatedAccountId: config?.obfuscatedAccountId,
          subscriptionOffers: [{ sku: product.id, offerToken }],
        } },
      });
    } catch (cause) {
      setBusyProduct(null);
      if (!isUserCancelledError(cause)) setError(cause instanceof Error ? cause.message : (vi ? "Không thể bắt đầu thanh toán." : "Could not start the purchase."));
    }
  }

  async function restore() {
    setRestoring(true); setMessage(null); setError(null);
    try {
      const purchases = await getAvailablePurchases({ includeSuspendedAndroid: false });
      const candidates = purchases.filter((purchase) => config?.productIds.includes(purchase.productId));
      let restored = 0;
      for (const candidate of candidates) if (await verify(candidate, "RESTORE")) restored += 1;
      setMessage(restored > 0
        ? (vi ? `Đã xác minh ${restored} giao dịch và cập nhật quyền Premium.` : `Verified ${restored} purchase(s) and updated Premium.`)
        : (vi ? "Không tìm thấy gói đang hoạt động cho tài khoản Google Play này." : "No active purchase was found for this Google Play account."));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể khôi phục giao dịch." : "Could not restore purchases."));
    } finally { setRestoring(false); }
  }

  return <Card>
    <Text style={styles.title}>{vi ? "Premium trên Google Play" : "Premium on Google Play"}</Text>
    <Muted>{vi ? "Giá và điều khoản do Google Play hiển thị. Quyền Premium chỉ được mở sau khi máy chủ xác minh giao dịch." : "Google Play shows the price and terms. Premium unlocks only after server verification."}</Muted>
    {error ? <ErrorBanner message={error} retry={() => void loadProducts()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    {config?.available ? products.map((product) => <View key={product.id} style={styles.product}>
      <View style={styles.productCopy}><Text style={styles.productTitle}>{product.title}</Text><Muted>{product.displayPrice}</Muted></View>
      <PrimaryButton busy={busyProduct === product.id} disabled={!connected || restoring || Boolean(busyProduct)} label={vi ? "Mua" : "Buy"} onPress={() => void purchase(product)} />
    </View>) : <Muted>{vi ? "Mua trong ứng dụng sẽ xuất hiện sau khi sản phẩm và xác minh máy chủ được cấu hình trên Play Console." : "In-app purchase appears after Play Console products and server verification are configured."}</Muted>}
    {config?.available && products.length === 0 ? <Muted>{connected ? (vi ? "Google Play chưa trả về sản phẩm khả dụng cho bản dựng này." : "Google Play returned no available product for this build.") : (vi ? "Đang kết nối Google Play…" : "Connecting to Google Play…")}</Muted> : null}
    <PrimaryButton busy={restoring} disabled={!connected || Boolean(busyProduct)} label={vi ? "Khôi phục giao dịch" : "Restore purchases"} onPress={() => void restore()} />
  </Card>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  success: { color: colors.success, backgroundColor: colors.successSurface, padding: space.sm, fontSize: 15, lineHeight: 22 },
  product: { gap: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.rule },
  productCopy: { gap: 2 },
  productTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
});
