const AVATAR_PATH = "/api/profile/avatar/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildAvatarUrl(appUrl: string, assetId: string) {
  if (!isAvatarAssetId(assetId)) throw new Error("AVATAR_ASSET_ID_INVALID");
  return new URL(`${AVATAR_PATH}${assetId}`, appUrl).toString();
}

export function isAvatarAssetId(value: string) {
  return UUID.test(value);
}

export function avatarAssetId(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  try {
    const path = new URL(avatarUrl).pathname;
    if (!path.startsWith(AVATAR_PATH)) return null;
    const id = path.slice(AVATAR_PATH.length);
    return isAvatarAssetId(id) && !id.includes("/") ? id : null;
  } catch {
    return null;
  }
}

export function canViewAvatar(ownerUserId: string, visibility: string, viewerUserId?: string | null) {
  return visibility === "PUBLIC" || ownerUserId === viewerUserId;
}
