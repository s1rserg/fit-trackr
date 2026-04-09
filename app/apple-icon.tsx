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
          backgroundColor: "#07130b",
          backgroundImage:
            "radial-gradient(circle at 22% 18%, rgba(163, 230, 53, 0.2), transparent 28%), radial-gradient(circle at 78% 16%, rgba(34, 197, 94, 0.24), transparent 28%), linear-gradient(160deg, #0b1f12 0%, #050816 100%)",
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
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            width: 126,
            height: 70,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #ecfdf5 0%, #bbf7d0 100%)",
              borderRadius: 999,
              boxShadow: "0 0 10px rgba(134, 239, 172, 0.3)",
              height: 10,
              width: 98,
            }}
          />
          {[
            { left: 0, height: 42 },
            { left: 14, height: 30 },
            { right: 14, height: 30 },
            { right: 0, height: 42 },
          ].map((plate, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
                border: "3px solid rgba(240, 253, 244, 0.16)",
                borderRadius: 12,
                height: plate.height,
                position: "absolute",
                width: 14,
                ...(plate.left !== undefined ? { left: plate.left } : {}),
                ...(plate.right !== undefined ? { right: plate.right } : {}),
              }}
            />
          ))}
          <div
            style={{
              alignItems: "center",
              background: "rgba(7, 19, 11, 0.88)",
              border: "2px solid rgba(187, 247, 208, 0.24)",
              borderRadius: 18,
              bottom: -6,
              display: "flex",
              justifyContent: "center",
              position: "absolute",
              width: 54,
              height: 54,
            }}
          >
            <span
              style={{
                color: "#bef264",
                fontSize: 30,
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
