import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Traffic Sign Recognition",
    short_name: "TSR",
    description: "A video analysis tool for traffic sign recognition",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ca9610",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}