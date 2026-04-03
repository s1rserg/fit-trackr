import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#050816",
          backgroundImage:
            "radial-gradient(circle at top, rgba(34, 197, 94, 0.35), transparent 35%)",
          backgroundRepeat: "no-repeat",
          borderRadius: 36,
          color: "#f8fafc",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "8px solid rgba(34, 197, 94, 0.9)",
            borderRadius: 40,
            boxShadow: "0 0 0 8px rgba(34, 197, 94, 0.16)",
            display: "flex",
            height: 92,
            alignItems: "center",
            justifyContent: "center",
            width: 92,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.08em",
              marginLeft: 4,
            }}
          >
            F
          </span>
        </div>
      </div>
    ),
    size,
  );
}
