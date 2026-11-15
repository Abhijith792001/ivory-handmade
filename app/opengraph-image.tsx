import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ivory – Handmade with love";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand share card: the Ivory logo centred on ivory paper.
export default async function OGImage() {
  const logo = await fetch(new URL("../public/images/ivory-logo-web.png", import.meta.url)).then((r) => r.arrayBuffer());
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FBF3EA" }}>
        <div style={{ position: "absolute", width: 520, height: 520, borderRadius: 999, background: "#F3E6D6" }} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo as unknown as string} width={604} height={450} style={{ position: "relative" }} />
      </div>
    ),
    size
  );
}
