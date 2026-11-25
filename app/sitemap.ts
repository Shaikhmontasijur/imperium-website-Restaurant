import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://imperiumqatar.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/en`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en/checkout`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
