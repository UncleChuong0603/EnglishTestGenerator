import Ionicons from "@expo/vector-icons/Ionicons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { PracticeSession } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { cachedAudioUri } from "@/lib/audio-cache";
import { colors, radius, space } from "@/theme";

type Media = NonNullable<PracticeSession["questions"][number]["media"]>[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function AudioControl({ item, onRetry, vi }: { item: Media; onRetry?: () => Promise<void>; vi: boolean }) {
  const auth = useAuth();
  const [source, setSource] = useState<string | { uri: string; headers: Record<string, string> }>(() => ({ uri: item.url, headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {} as Record<string, string> }));
  const player = useAudioPlayer(source, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    let active = true;
    if (auth.token) void cachedAudioUri(item.id, item.url, auth.token).then((uri) => { if (active && uri) setSource(uri); });
    return () => { active = false; };
  }, [auth.token, item.id, item.url]);
  useEffect(() => () => { player.setActiveForLockScreen(false); }, [player]);
  const finished = status.duration > 0 && status.currentTime >= status.duration - 0.15;
  const label = status.playing
    ? (vi ? "Tạm dừng audio" : "Pause audio")
    : finished
      ? (vi ? "Nghe lại audio" : "Replay audio")
      : (vi ? "Phát audio" : "Play audio");

  async function toggle() {
    if (status.playing) {
      player.pause();
      player.setActiveForLockScreen(false);
      return;
    }
    if (finished) await player.seekTo(0);
    player.setActiveForLockScreen(true, { title: item.alt || "TOEIC listening", artist: "TOEIC GYM" });
    player.play();
  }

  async function retry() {
    setRetrying(true);
    try {
      player.replace({ uri: item.url, headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {} });
      await onRetry?.();
    } catch {
      // The player error remains visible so the learner can retry again.
    } finally {
      setRetrying(false);
    }
  }

  if (status.error) return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.mediaError}>
      <Text style={styles.mediaErrorText}>{vi ? "Không thể phát audio. Kiểm tra kết nối rồi thử lại." : "Audio could not play. Check your connection and try again."}</Text>
      <Pressable accessibilityRole="button" disabled={retrying} onPress={() => void retry()} style={({ pressed }) => [styles.retryButton, (pressed || retrying) && styles.pressed]}>
        <Text style={styles.retryText}>{retrying ? (vi ? "Đang thử lại…" : "Retrying…") : (vi ? "Thử lại audio" : "Retry audio")}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.audio}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={!status.isLoaded}
        onPress={() => void toggle()}
        style={({ pressed }) => [styles.audioButton, (pressed || !status.isLoaded) && styles.pressed]}
      >
        <Ionicons color="#fff" name={status.playing ? "pause" : finished ? "refresh" : "play"} size={24} />
      </Pressable>
      <View style={styles.audioText}>
        <Text style={styles.audioTitle}>{item.alt || (vi ? "Audio câu hỏi" : "Question audio")}</Text>
        <Text style={styles.audioTime}>
          {status.isLoaded
            ? `${formatTime(status.currentTime)} / ${formatTime(status.duration)}`
            : (vi ? "Đang tải audio…" : "Loading audio…")}
        </Text>
      </View>
    </View>
  );
}

function QuestionImage({ item, onRetry, vi }: { item: Media; onRetry?: () => Promise<void>; vi: boolean }) {
  const auth = useAuth();
  const [failed, setFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await onRetry?.();
      setFailed(false);
    } catch {
      // Keep the image error visible when the canonical session cannot reload.
    } finally {
      setRetrying(false);
    }
  }

  if (failed) return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.mediaError}>
      <Text style={styles.mediaErrorText}>{vi ? "Không thể tải hình ảnh. Câu trả lời của bạn chưa bị nộp." : "The image could not load. Your answer was not submitted."}</Text>
      <Pressable accessibilityRole="button" disabled={retrying} onPress={() => void retry()} style={({ pressed }) => [styles.retryButton, (pressed || retrying) && styles.pressed]}>
        <Text style={styles.retryText}>{retrying ? (vi ? "Đang thử lại…" : "Retrying…") : (vi ? "Thử lại hình ảnh" : "Retry image")}</Text>
      </Pressable>
    </View>
  );

  return <Image
    accessibilityLabel={item.alt}
    alt={item.alt}
    onError={() => setFailed(true)}
    onLoad={() => setFailed(false)}
    resizeMode="contain"
    source={{ uri: item.url, headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined }}
    style={styles.image}
  />;
}

export function QuestionMedia({ media = [], onRetry, vi }: { media?: Media[]; onRetry?: () => Promise<void>; vi: boolean }) {
  const audio = media.find((item) => item.kind === "AUDIO");
  const images = media.filter((item) => item.kind === "IMAGE");
  return (
    <View style={styles.container}>
      {audio ? <AudioControl item={audio} onRetry={onRetry} vi={vi} /> : null}
      {images.map((item) => (
        <QuestionImage item={item} key={item.id} onRetry={onRetry} vi={vi} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.sm },
  audio: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    padding: space.sm,
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  audioText: { flex: 1 },
  audioTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  audioTime: { color: colors.muted, fontSize: 14, marginTop: 2 },
  image: { width: "100%", minHeight: 180, borderRadius: radius.md, backgroundColor: colors.paper },
  mediaError: { gap: space.sm, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, backgroundColor: "#fff1f2", padding: space.md },
  mediaErrorText: { color: colors.danger, fontSize: 15, lineHeight: 22, fontWeight: "700" },
  retryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: space.md },
  retryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.55 },
});
