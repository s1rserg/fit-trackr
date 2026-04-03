import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#050816",
          backgroundImage:
            "radial-gradient(circle at top, rgba(34, 197, 94, 0.35), transparent 35%)",
          backgroundRepeat: "no-repeat",
          color: "#f8fafc",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "18px solid rgba(34, 197, 94, 0.9)",
            borderRadius: 120,
            boxShadow: "0 0 0 18px rgba(34, 197, 94, 0.16)",
            display: "flex",
            height: 280,
            alignItems: "center",
            justifyContent: "center",
            width: 280,
          }}
        >
          <span
            style={{
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: "-0.08em",
              marginLeft: 8,
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
