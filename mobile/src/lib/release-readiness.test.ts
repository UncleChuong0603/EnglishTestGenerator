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

describe("Task 53 release candidate configuration", () => {
  it("defines explicit development, preview APK and production store profiles", () => {
    const eas = JSON.parse(read("eas.json")) as {
      build: Record<string, Record<string, unknown>>;
      submit: {
        production: {
          android: { track: string; releaseStatus: string };
        };
      };
    };
    expect(eas.build.development).toMatchObject({
      developmentClient: true,
      distribution: "internal",
    });
    expect(eas.build.preview).toMatchObject({
      distribution: "internal",
      android: { buildType: "apk" },
    });
    expect(eas.build.production).toMatchObject({
      distribution: "store",
      autoIncrement: false,
    });
    expect(eas.submit.production.android).toEqual({
      track: "internal",
      releaseStatus: "draft",
    });
  });

  it("installs the native development client only for development builds", () => {
    const manifest = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
    };
    expect(manifest.dependencies["expo-dev-client"]).toMatch(/^~57\./);
    expect(read("eas.json")).toContain('"developmentClient": true');
  });

  it.each(["vi", "en"])(
    "ships a Google Play %s feature graphic with exact dimensions and no alpha",
    (locale) => {
      const image = readFileSync(
        `store/assets/google-play-feature-graphic-${locale}-1024x500.png`,
      );
      expect(image.subarray(1, 4).toString("ascii")).toBe("PNG");
      expect(image.readUInt32BE(16)).toBe(1024);
      expect(image.readUInt32BE(20)).toBe(500);
      expect(image[25]).toBe(2);
    },
  );

  it.each(["vi-VN", "en-US"])(
    "keeps %s store copy within platform limits and points to public support pages",
    (locale) => {
      const listing = read(`store/listing/${locale}.md`);
      const subtitle = listing.match(/App Store subtitle: `([^`]+)`/)?.[1];
      const shortDescription = listing.match(
        /Google Play short description: `([^`]+)`/,
      )?.[1];
      expect(subtitle?.length).toBeLessThanOrEqual(30);
      expect(shortDescription?.length).toBeLessThanOrEqual(80);
      for (const path of ["privacy", "support", "delete-account"]) {
        expect(listing).toContain(`https://toeicgym.net/${path}`);
      }
      expect(listing).toMatch(
        /no TOEIC score prediction|không dự đoán điểm TOEIC/i,
      );
    },
  );
});
