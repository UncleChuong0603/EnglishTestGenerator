import Ionicons from "@expo/vector-icons/Ionicons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { PracticeSession } from "@/api/types";
import { colors, radius, space } from "@/theme";

type Media = NonNullable<PracticeSession["questions"][number]["media"]>[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function AudioControl({ item, vi }: { item: Media; vi: boolean }) {
  const player = useAudioPlayer(item.url, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const finished = status.duration > 0 && status.currentTime >= status.duration - 0.15;
  const label = status.playing
    ? (vi ? "Tạm dừng audio" : "Pause audio")
    : finished
      ? (vi ? "Nghe lại audio" : "Replay audio")
      : (vi ? "Phát audio" : "Play audio");

  async function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (finished) await player.seekTo(0);
    player.play();
  }

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

export function QuestionMedia({ media = [], vi }: { media?: Media[]; vi: boolean }) {
  const audio = media.find((item) => item.kind === "AUDIO");
  const images = media.filter((item) => item.kind === "IMAGE");
  return (
    <View style={styles.container}>
      {audio ? <AudioControl item={audio} vi={vi} /> : null}
      {images.map((item) => (
        <Image
          accessibilityLabel={item.alt}
          alt={item.alt}
          key={item.id}
          resizeMode="contain"
          source={{ uri: item.url }}
          style={styles.image}
        />
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
  pressed: { opacity: 0.55 },
});
