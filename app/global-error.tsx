"use client";

/**
 * Last-resort boundary. This replaces the root layout entirely when it fires,
 * so it must render its own <html>/<body> and must not depend on Chakra, the
 * theme providers or any app CSS — none of that is mounted at this point.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#fafaf9",
          color: "#1c1917",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#57534e", margin: "0 0 16px" }}>
            The page failed to render. The details below are what the server reported.
          </p>
          <pre
            style={{
              background: "#f5f5f4",
              border: "1px solid #e7e5e4",
              borderRadius: "6px",
              padding: "12px",
              fontSize: "12px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: "0 0 16px",
            }}
          >
            {error.message || "No error message was provided."}
            {error.digest ? `\n\nDigest: ${error.digest}` : ""}
          </pre>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#b91c1c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "9px 16px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
