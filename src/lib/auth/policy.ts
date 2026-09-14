export type GoogleAccountDecision =
  | "login_linked_identity"
  | "link_to_authenticated_user"
  | "create_google_user"
  | "reject_identity_owned_by_another_user"
  | "require_explicit_link"
  | "reject_link_context";

export function decideGoogleAccount(input: {
  identityUserId?: string;
  emailOwnerUserId?: string;
  linkUserId?: string;
  currentUserId?: string;
  currentUserEmail?: string;
  googleEmail: string;
}): GoogleAccountDecision {
  if (input.identityUserId) {
    return input.linkUserId && input.identityUserId !== input.linkUserId
      ? "reject_identity_owned_by_another_user"
      : "login_linked_identity";
  }
  if (input.linkUserId) {
    return input.currentUserId === input.linkUserId && input.currentUserEmail === input.googleEmail
      ? "link_to_authenticated_user"
      : "reject_link_context";
  }
  return input.emailOwnerUserId ? "require_explicit_link" : "create_google_user";
}
