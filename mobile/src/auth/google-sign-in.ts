import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
let configured = false;

export const googleSignInAvailable = Boolean(webClientId);

export function configureGoogleSignIn(nonce: string) {
  if (!webClientId) return false;
  GoogleOneTapSignIn.configure({
    webClientId,
    autoSelectOnSignIn: false,
    nonce,
  });
  configured = true;
  return true;
}

export async function clearGoogleSignIn() {
  if (!configured) return;
  await GoogleOneTapSignIn.signOut();
}
