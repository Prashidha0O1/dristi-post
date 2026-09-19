// Plain module (no "use server"): a Server Action file may export ONLY async
// functions, so the InviteState type and its idle value live here and are
// imported by both the action and the client form.

export type InviteState =
  | { status: "idle" }
  | { status: "ok"; path: string; email: string; emailed: boolean }
  | { status: "error"; message: string };

export const idleInviteState: InviteState = { status: "idle" };
