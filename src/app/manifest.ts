import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Role Path — Career Operating System",
    short_name: "AI Role Path",
    description: "AI-powered Career Operating System for discovering roles, following structured roadmaps, building skills, and tracking career progress.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E1422",
    theme_color: "#0E1422",
    icons: [
      {
        src: "/brand/ai-role-path/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand/ai-role-path/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
