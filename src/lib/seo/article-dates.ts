import type { InterfaceLanguage } from "@/lib/i18n/config";

export function articleDateLabels(publishedAt: Date | null, updatedAt: Date, locale: InterfaceLanguage) {
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const format = (date: Date) => date.toLocaleDateString(dateLocale, { timeZone: "UTC" });
  const publishedDay = publishedAt?.toISOString().slice(0, 10);
  const updatedDay = updatedAt.toISOString().slice(0, 10);

  return {
    published: publishedAt ? `${locale === "vi" ? "Đăng" : "Published"} ${format(publishedAt)}` : null,
    updated: publishedDay && updatedDay > publishedDay
      ? `${locale === "vi" ? "Cập nhật" : "Updated"} ${format(updatedAt)}`
      : null,
  };
}
