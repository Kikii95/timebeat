"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "24rem", textAlign: "center" }}>
            <div style={{ marginBottom: "1.5rem", fontSize: "4rem" }}>🔥</div>
            <h1
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              Critical Error
            </h1>
            <p style={{ marginBottom: "1.5rem", color: "#666" }}>
              The application encountered a critical error.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4ECDC4",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
