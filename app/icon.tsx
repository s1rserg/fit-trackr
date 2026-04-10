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
          backgroundColor: "#091309",
          backgroundImage:
            "radial-gradient(circle at 22% 16%, rgba(163, 230, 53, 0.24), transparent 30%), radial-gradient(circle at 80% 14%, rgba(34, 197, 94, 0.26), transparent 28%), linear-gradient(160deg, #0f2315 0%, #060b12 100%)",
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
            background: "rgba(9, 19, 9, 0.74)",
            border: "8px solid rgba(236, 253, 245, 0.2)",
            borderRadius: 96,
            boxShadow: "0 18px 42px rgba(0, 0, 0, 0.38)",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            height: 360,
            justifyContent: "center",
            width: 360,
          }}
        >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                position: "relative",
                width: 210,
                height: 88,
              }}
            >
              <div
                style={{
                  background: "linear-gradient(180deg, #f0fdf4 0%, #bbf7d0 100%)",
                  borderRadius: 999,
                  boxShadow: "0 0 16px rgba(134, 239, 172, 0.28)",
                  height: 20,
                  width: 210,
                }}
              />
              {[
                { left: -70, size: 88 },
                { left: -36, size: 62 },
                { right: -36, size: 62 },
                { right: -70, size: 88 },
              ].map((plate, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
                    border: "8px solid rgba(240, 253, 244, 0.2)",
                    borderRadius: 24,
                    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.3)",
                    height: plate.size,
                    position: "absolute",
                    width: 30,
                    ...(plate.left !== undefined ? { left: plate.left } : {}),
                    ...(plate.right !== undefined ? { right: plate.right } : {}),
                  }}
                />
              ))}
            </div>
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, #bef264 0%, #4ade80 100%)",
              borderRadius: 26,
              display: "flex",
              height: 124,
              justifyContent: "center",
              width: 124,
            }}
          >
            <span style={{ color: "#052e16", fontSize: 78, fontWeight: 900, lineHeight: 1 }}>
              F
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
