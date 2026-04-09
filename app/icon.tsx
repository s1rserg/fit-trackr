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
          backgroundColor: "#07130b",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(163, 230, 53, 0.22), transparent 30%), radial-gradient(circle at 80% 15%, rgba(34, 197, 94, 0.25), transparent 28%), linear-gradient(160deg, #0b1f12 0%, #050816 100%)",
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
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            width: 340,
            height: 180,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #ecfdf5 0%, #bbf7d0 100%)",
              borderRadius: 999,
              boxShadow: "0 0 24px rgba(134, 239, 172, 0.32)",
              height: 24,
              width: 260,
            }}
          />
          {[
            { left: 18, size: 88 },
            { left: 58, size: 62 },
            { right: 58, size: 62 },
            { right: 18, size: 88 },
          ].map((plate, index) => (
            <div
              key={index}
              style={{
                alignItems: "center",
                background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
                border: "8px solid rgba(240, 253, 244, 0.16)",
                borderRadius: 28,
                boxShadow: "0 16px 30px rgba(0, 0, 0, 0.28)",
                display: "flex",
                height: plate.size,
                justifyContent: "center",
                position: "absolute",
                width: 34,
                ...(plate.left !== undefined ? { left: plate.left } : {}),
                ...(plate.right !== undefined ? { right: plate.right } : {}),
              }}
            >
              <div
                style={{
                  background: "rgba(240, 253, 244, 0.85)",
                  borderRadius: 999,
                  height: 12,
                  width: 12,
                }}
              />
            </div>
          ))}
          <div
            style={{
              alignItems: "center",
              background: "rgba(7, 19, 11, 0.86)",
              border: "2px solid rgba(187, 247, 208, 0.24)",
              borderRadius: 28,
              bottom: 8,
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.32)",
              display: "flex",
              gap: 12,
              padding: "14px 20px",
              position: "absolute",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #bef264 0%, #4ade80 100%)",
                borderRadius: 10,
                color: "#052e16",
                fontSize: 48,
                fontWeight: 900,
                height: 56,
                width: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              F
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#ecfdf5",
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>Fit</span>
              <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>Trackr</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
