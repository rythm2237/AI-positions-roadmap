import { createElement } from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 140"><defs><linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#247BFF"/><stop offset="52%" stop-color="#5B3DFF"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs><g transform="translate(4 0)"><path d="M 0 1 L 0 47 L 17 57 L 0 68 L 1 118 L 18 109 L 18 77 L 47 60 L 18 42 L 19 30 L 70 59 L 29 83 L 29 102 L 105 60 L 33 17 Z" fill="url(#g)" fill-rule="evenodd"/></g><text x="132" y="79" fill="#F8FAFC" font-family="Inter,Arial,sans-serif" font-size="55" font-weight="500" letter-spacing="-1.2">AI Role Path</text><text x="132" y="109" fill="#8B5CF6" font-family="Inter,Arial,sans-serif" font-size="15" font-weight="600" letter-spacing="4.5">CAREER OPERATING SYSTEM</text></svg>`;
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

export async function GET() {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 32% 25%, #20175a 0%, #0e1422 42%, #03050e 100%)",
          border: "2px solid rgba(255,255,255,.12)",
          color: "#f8fafc",
        },
      },
      createElement("img", {
        src: logoDataUri,
        width: 860,
        height: 194,
        alt: "AI Role Path — Career Operating System",
      }),
      createElement(
        "div",
        {
          style: {
            marginTop: 42,
            fontFamily: "Arial, sans-serif",
            fontSize: 28,
            letterSpacing: 1.5,
            color: "#94a3b8",
          },
        },
        "airolepath.com",
      ),
    ),
    { width: 1200, height: 630 },
  );
}
