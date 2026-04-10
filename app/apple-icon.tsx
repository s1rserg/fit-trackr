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
          backgroundColor: "#091309",
          backgroundImage:
            "radial-gradient(circle at 24% 18%, rgba(163, 230, 53, 0.24), transparent 30%), radial-gradient(circle at 80% 16%, rgba(34, 197, 94, 0.25), transparent 30%), linear-gradient(160deg, #0f2315 0%, #060b12 100%)",
          backgroundRepeat: "no-repeat",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(9, 19, 9, 0.78)",
            border: "3px solid rgba(236, 253, 245, 0.22)",
            borderRadius: 36,
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.34)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            height: 132,
            justifyContent: "center",
            position: "relative",
            width: 132,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #f0fdf4 0%, #bbf7d0 100%)",
              borderRadius: 999,
              boxShadow: "0 0 8px rgba(134, 239, 172, 0.28)",
              height: 8,
              width: 76,
            }}
          />
          {[
            { left: -26, height: 32 },
            { left: -14, height: 22 },
            { right: -14, height: 22 },
            { right: -26, height: 32 },
          ].map((plate, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
                border: "3px solid rgba(240, 253, 244, 0.2)",
                borderRadius: 10,
                height: plate.height,
                position: "absolute",
                width: 10,
                ...(plate.left !== undefined ? { left: plate.left } : {}),
                ...(plate.right !== undefined ? { right: plate.right } : {}),
              }}
            />
          ))}
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, #bef264 0%, #4ade80 100%)",
              borderRadius: 18,
              display: "flex",
              justifyContent: "center",
              width: 56,
              height: 56,
            }}
          >
            <span
              style={{
                color: "#052e16",
                fontSize: 34,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              F
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
