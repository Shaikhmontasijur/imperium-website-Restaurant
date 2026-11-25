import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import businessConfig from "@/config/business-config.json";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imperiumqatar.com"),
  title: {
    default: "IMPERIUM Restaurant | Royal Feast of Indian, Arabic & Indo-Chinese Dining in Qatar",
    template: "%s | IMPERIUM Restaurant Qatar",
  },
  description:
    "Experience a royal feast in Qatar at IMPERIUM Restaurant. Savor authentic dum biryanis, aromatic Yemeni Mandi, charcoal grills, Kerala beef fry, and wok-flamed noodles. Express delivery & takeaway across Al Rayyan and Doha.",
  keywords: [
    "IMPERIUM Restaurant",
    "IMPERIUM Qatar",
    "Indian restaurant Al Rayyan",
    "Best Biryani Qatar",
    "Mandi Al Rayyan",
    "Charcoal Grills Qatar",
    "Online food delivery Qatar",
    "Restaurant CR 229987",
    "+974 5105 3510",
  ],
  authors: [{ name: "IMPERIUM Restaurant" }],
  creator: "IMPERIUM Restaurant",
  openGraph: {
    type: "website",
    locale: "en_QA",
    url: "https://imperiumqatar.com",
    siteName: "IMPERIUM Restaurant",
    title: "IMPERIUM Restaurant | A Royal Feast of Flavours in Qatar",
    description:
      "Authentic Indian royal spices, fragrant Arabian Mandi & grills, and Indo-Chinese delights. Order online for express delivery across Doha & Al Rayyan.",
    images: [
      {
        url: "/images/hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: "IMPERIUM Restaurant Royal Feast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPERIUM Restaurant | A Royal Feast of Flavours in Qatar",
    description:
      "Authentic Indian dum biryani, Arabian Mandi & charcoal grills. Order online directly.",
    images: ["/images/hero-banner.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: businessConfig.restaurant.name,
    image: "https://imperiumqatar.com/images/hero-banner.jpg",
    "@id": "https://imperiumqatar.com",
    url: "https://imperiumqatar.com",
    telephone: businessConfig.restaurant.phone,
    priceRange: "$$",
    servesCuisine: ["Indian", "Middle Eastern", "Arabian", "Chinese", "Barbecue"],
    menu: "https://imperiumqatar.com/en#menu",
    acceptsReservations: "True",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Amir Street",
      addressLocality: "Al Rayyan",
      addressRegion: "Al Rayyan",
      postalCode: "00000",
      addressCountry: "QA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: businessConfig.restaurant.coordinates.lat,
      longitude: businessConfig.restaurant.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "01:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday"],
        opens: "11:00",
        closes: "02:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "12:30",
        closes: "02:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      reviewCount: "148",
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      merchantReturnLink: "https://imperiumqatar.com",
    },
  };

  return (
    <html lang="en" dir="ltr" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-imperium-charcoal text-imperium-ivory font-sans antialiased selection:bg-imperium-gold/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
