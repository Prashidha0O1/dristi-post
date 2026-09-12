import { NotFoundError, ValidationError } from "@/lib/application/validation";

/**
 * The result an admin form action hands back to its form.
 *
 * Previously these actions simply threw. `ValidationError` carries a per-field
 * `issues` map, but nothing ever caught it: with no error boundary and no
 * `useActionState`, a rejected save became an unhandled server error and the
 * editor lost everything they had typed. Returning the failure instead lets the
 * form re-render in place, with the messages next to the fields that caused
 * them and the typed values still in the inputs.
 */
export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; issues: Record<string, string> };

export const idleFormState: FormState = { status: "idle" };

/**
 * Runs a mutation and converts a throw into a `FormState`.
 *
 * Returns `null` on success, which is the caller's signal that it is safe to
 * proceed to `updateTag(...)` + `redirect(...)`. Those MUST happen outside this
 * helper: `redirect()` works by throwing a NEXT_REDIRECT signal, so calling it
 * inside the try below would be caught here and silently turned into an error
 * message instead of a navigation.
 */
export async function runFormAction(mutate: () => Promise<void>): Promise<FormState | null> {
  try {
    await mutate();
    return null;
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: "error",
        message: "Some fields need attention before this can be saved.",
        issues: error.issues,
      };
    }

    if (error instanceof NotFoundError) {
      return { status: "error", message: error.message, issues: {} };
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        status: "error",
        message: "Your session has expired. Open the admin in a new tab to sign in, then save again.",
        issues: {},
      };
    }

    // Anything else is a genuine fault (a dead database, a missing env var).
    // Log it server-side and show something honest rather than pretending the
    // editor can fix it by editing a field.
    console.error("[admin] action failed", error);
    return {
      status: "error",
      message:
        error instanceof Error && error.message
          ? `Could not save: ${error.message}`
          : "Could not save. The change was not applied.",
      issues: {},
    };
  }
}
