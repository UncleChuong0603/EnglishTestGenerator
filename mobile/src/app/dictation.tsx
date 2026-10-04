import { useEffect, useState } from "react";
import { router, type Href } from "expo-router";
import { Text, View } from "react-native";
import { api } from "@/api/client";
import type {
  DictationCatalogResponse,
  DictationHistoryResponse,
} from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import {
  Card,
  ErrorBanner,
  Loading,
  Muted,
  PrimaryButton,
  Screen,
  Title,
} from "@/components/ui";
import { colors, radius, space } from "@/theme";

export default function DictationCatalogScreen() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [data, setData] = useState<DictationCatalogResponse["data"] | null>(
    null,
  );
  const [history, setHistory] = useState<DictationHistoryResponse["data"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    if (!auth.token) return;
    void Promise.all([
      api.dictationCatalog(auth.token),
      api.dictationHistory(auth.token),
    ])
      .then(([catalogResponse, historyResponse]) => {
        setData(catalogResponse.data);
        setHistory(historyResponse.data);
      })
      .catch(() =>
        setError(
          vi
            ? "Không thể tải bài chính tả."
            : "Could not load dictation clips.",
        ),
      );
  }, [auth.token, vi]);
  async function start(sourceRef: string) {
    if (!auth.token) return;
    setBusy(sourceRef);
    try {
      const response = await api.startDictation(auth.token, { sourceRef });
      router.push(`/dictation/${response.data.id}` as Href);
    } catch {
      setError(vi ? "Không thể bắt đầu." : "Could not start.");
      setBusy(null);
    }
  }
  if (!data && !error)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  return (
    <Screen>
      <Title>{vi ? "Nghe – chép chính tả" : "Listening dictation"}</Title>
      <Muted>
        {vi
          ? "Nghe toàn bộ segment 1 phút và chép lại. Transcript chỉ hiện sau lần kiểm tra đầu tiên."
          : "Listen to the full one-minute segment and transcribe it. The transcript appears only after your first check."}
      </Muted>
      {data?.recommendation ? (
        <View
          style={{
            backgroundColor: "#fff7d6",
            padding: space.md,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ color: colors.ink }}>
            {vi
              ? "Được gợi ý từ kiểu lỗi nghe gần đây của bạn."
              : "Suggested from your recent listening mistake pattern."}
          </Text>
        </View>
      ) : null}
      {error ? <ErrorBanner message={error} /> : null}
      {data?.items.map((item) => (
        <Card key={item.sourceRef}>
          <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>
            {vi ? item.title.vi : item.title.en}
          </Text>
          <Muted>{vi ? item.description.vi : item.description.en}</Muted>
          <PrimaryButton
            busy={busy === item.sourceRef}
            disabled={busy !== null}
            label={vi ? "Bắt đầu" : "Start"}
            onPress={() => void start(item.sourceRef)}
          />
        </Card>
      ))}
      {history.length ? (
        <View style={{ gap: space.sm }}>
          <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>
            {vi ? "Lịch sử gần đây" : "Recent history"}
          </Text>
          <Muted>
            {vi
              ? "Tối đa 20 buổi gần nhất."
              : "Up to your 20 most recent sessions."}
          </Muted>
          {history.map((item) => (
            <Card key={item.id}>
              <Text
                style={{ color: colors.ink, fontSize: 17, fontWeight: "800" }}
              >
                {vi ? item.title.vi : item.title.en}
              </Text>
              <Muted>
                {item.status === "MASTERED"
                  ? vi
                    ? `Đã thành thạo · Tốt nhất ${item.bestAccuracy}%`
                    : `Mastered · Best ${item.bestAccuracy}%`
                  : vi
                    ? `Đang luyện · Tốt nhất ${item.bestAccuracy}%`
                    : `In progress · Best ${item.bestAccuracy}%`}
              </Muted>
              <PrimaryButton
                label={vi ? "Tiếp tục" : "Continue"}
                onPress={() => router.push(`/dictation/${item.id}` as Href)}
              />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
