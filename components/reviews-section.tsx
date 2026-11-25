import React from "react";
import { Star, Sparkles, ExternalLink, Quote } from "lucide-react";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface ReviewItem {
  name: string;
  rating: number;
  date: string;
  text: string;
  dishRecommended: string;
}

export const ReviewsSection: React.FC = () => {
  const reviews: ReviewItem[] = [
    {
      name: "Rashid Al-Kuwari",
      rating: 5,
      date: "3 weeks ago",
      text: "Outstanding authentic dum biryani! The aroma of the saffron basmati and tenderness of the meat is easily top-tier in Qatar. The Mandi rice was packed with flavour and the garlic toum was fresh. Highly recommend!",
      dishRecommended: "Royal Chicken Dum Biryani & Mandi",
    },
    {
      name: "Mohammed Firas",
      rating: 5,
      date: "a month ago",
      text: "The Black Pepper Beef Fry is spectacular—crisp coconut chips and sharp peppercorn heat just like in authentic Malabar cooking. We also ordered the charcoal half chicken and it was juicy right to the bone.",
      dishRecommended: "Black Pepper Beef Fry & Charcoal Chicken",
    },
    {
      name: "Anas Bin Tariq",
      rating: 5,
      date: "2 months ago",
      text: "Excellent service and express delivery to Al Rayyan! Arrived piping hot in under 35 minutes. Double chicken burger was huge and crispy, and the mint mojito was exceptionally refreshing on a hot day.",
      dishRecommended: "Double Chicken Cheese Burger & Mojito",
    },
    {
      name: "Fatima E.",
      rating: 5,
      date: "2 months ago",
      text: "We had a family gathering and ordered the Mandi feast and Chicken 65. Generous portions, beautifully spiced, and courteous staff. Easily our new weekend favourite restaurant in Al Rayyan.",
      dishRecommended: "Mandi Feast & Chicken 65",
    },
    {
      name: "Jassim Al-Sulaiti",
      rating: 5,
      date: "3 months ago",
      text: "Very clean restaurant with authentic taste. The BBQ Grilled Fish is perfectly marinated with no fishy smell, crispy skin and smoky citrus notes. Best fish grill in the area.",
      dishRecommended: "Imperial BBQ Grilled Whole Fish",
    },
  ];

  return (
    <section id="reviews" className="py-24 bg-imperium-surface/60 relative border-t border-imperium-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{en.reviews.sectionTag}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight">
              {en.reviews.title}
            </h2>
            <p className="text-sm sm:text-base text-imperium-creamMuted max-w-xl">
              {en.reviews.subtitle}
            </p>
          </div>

          {/* Google Score Pill */}
          <div className="flex items-center gap-4 bg-imperium-card border border-imperium-border p-4 rounded-2xl shadow-sm">
            <div className="text-center">
              <span className="font-serif text-3xl font-black text-imperium-gold">
                {businessConfig.restaurant.rating}
              </span>
              <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
            <div className="border-s border-neutral-800 ps-4">
              <p className="text-xs font-bold text-imperium-ivory">
                {en.reviews.basedOn}
              </p>
              <a
                href={businessConfig.restaurant.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-imperium-gold hover:underline mt-0.5 font-medium"
              >
                <span>{en.reviews.writeReview}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-imperium-card border border-imperium-border flex flex-col justify-between hover:border-imperium-gold/40 transition-colors shadow-sm relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-serif font-bold text-imperium-gold">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-imperium-ivory">
                        {rev.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {rev.date} • {en.reviews.verified}
                      </span>
                    </div>
                  </div>
                  <Quote className="w-6 h-6 text-imperium-gold/20 group-hover:text-imperium-gold/40 transition-colors" />
                </div>

                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-imperium-creamMuted leading-relaxed italic mb-4">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                  Recommended:
                </span>
                <span className="text-xs font-semibold text-imperium-gold">
                  {rev.dishRecommended}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ReviewsSection;
