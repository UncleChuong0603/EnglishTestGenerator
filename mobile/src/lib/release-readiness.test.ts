/// <reference types="node" />

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Task 52 mobile release readiness", () => {
  it("pins store identity and keeps learning audio foreground-only", () => {
    const config = JSON.parse(read("app.json")) as {
      expo: {
        ios: { bundleIdentifier: string; buildNumber: string; supportsTablet: boolean };
        android: {
          package: string;
          versionCode: number;
          adaptiveIcon: { monochromeImage: string };
        };
        plugins: unknown[];
      };
    };
    expect(config.expo.ios).toMatchObject({
      bundleIdentifier: "net.toeicgym.app",
      buildNumber: "1",
      supportsTablet: false,
    });
    expect(config.expo.android).toMatchObject({
      package: "net.toeicgym.app",
      versionCode: 1,
    });
    expect(config.expo.android.adaptiveIcon.monochromeImage).toBe(
      "./assets/images/android-icon-monochrome.png",
    );
    expect(JSON.stringify(config.expo.plugins)).toContain(
      '"enableBackgroundPlayback":false',
    );
    expect(read("src/app/_layout.tsx")).toContain(
      "shouldPlayInBackground: false",
    );
  });

  it("exports and deletes through native authenticated APIs", () => {
    const screen = read("src/app/account-data.tsx");
    expect(screen).toContain("api.exportAccountData(auth.token)");
    expect(screen).toContain("api.deleteAccount(auth.token");
    expect(screen).toContain("Sharing.shareAsync");
    expect(screen).toContain("confirmationEmail");
    expect(screen).toContain("acknowledge: true");
    expect(screen).not.toContain("settings?section=data");
  });

  it("clears device secrets and caches after server-confirmed deletion", () => {
    const auth = read("src/auth/auth-context.tsx");
    for (const boundary of [
      "SecureStore.deleteItemAsync(TOKEN_KEY)",
      "clearLocalNotificationDevice()",
      "clearOfflineVocabulary()",
      "clearAudioCache()",
      "completeAccountDeletion()",
    ]) {
      expect(auth).toContain(boundary);
    }
  });
});
