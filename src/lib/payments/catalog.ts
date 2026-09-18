export const PREMIUM_PRODUCTS = {
  PREMIUM_30_DAYS: { days: 30, priceEnv: "PREMIUM_30_PRICE_VND" },
  PREMIUM_90_DAYS: { days: 90, priceEnv: "PREMIUM_90_PRICE_VND" },
  PREMIUM_365_DAYS: { days: 365, priceEnv: "PREMIUM_365_PRICE_VND" },
} as const;

export type PremiumProductKey = keyof typeof PREMIUM_PRODUCTS;

export function isPaymentProviderReady() {
  const provider = process.env.PAYMENT_PROVIDER ?? "PAYOS";
  if (provider === "FAKE") return process.env.NODE_ENV !== "production";
  return provider === "PAYOS" && Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY);
}

function configuredPrice(name: string) {
  const raw = process.env[name];
  if (!raw || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function getPaymentCatalog() { const providerReady=isPaymentProviderReady(); return Object.entries(PREMIUM_PRODUCTS).map(([key,value])=>{const amountVnd=configuredPrice(value.priceEnv);return {key:key as PremiumProductKey,days:value.days,amountVnd,purchasable:providerReady&&amountVnd!==null,currency:"VND" as const}}); }

export function resolveProduct(key: string) {
  const product = getPaymentCatalog().find((item) => item.key === key);
  if (!product) throw new Error("INVALID_PRODUCT");
  if (!product.amountVnd || !product.purchasable) throw new Error("PRODUCT_NOT_AVAILABLE");
  return { ...product, amountVnd: product.amountVnd };
}

export function resolveProductDuration(key: string) {
  if (!(key in PREMIUM_PRODUCTS)) throw new Error("INVALID_PRODUCT");
  return PREMIUM_PRODUCTS[key as PremiumProductKey].days;
}
