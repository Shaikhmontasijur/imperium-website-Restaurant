import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, ShieldCheck } from "lucide-react";
import { ImperiumLogo } from "./imperium-logo";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface FooterProps {
  lang?: string;
}

export const Footer: React.FC<FooterProps> = ({ lang = "en" }) => {
  return (
    <footer className="bg-imperium-charcoal border-t border-imperium-border relative overflow-hidden pb-20 sm:pb-8">
      {/* Subtle top gold accent line */}
      <div className="h-[2px] w-full bg-gold-gradient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Col 1: Brand Info & Cloche Logo (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href={`/${lang}`}>
              <ImperiumLogo size="md" />
            </Link>
            <p className="text-xs text-imperium-creamMuted max-w-sm leading-relaxed mt-3">
              {en.footer.desc}
            </p>
            <div className="flex items-center gap-2 text-xs text-imperium-gold pt-2 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{en.footer.legal}</span>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-imperium-ivory uppercase tracking-wider">
              {en.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-imperium-creamMuted">
              <li>
                <Link href={`/${lang}#hero`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#about`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#signature`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.signature}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#menu`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.menu}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#gallery`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.gallery}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#reviews`} className="hover:text-imperium-gold transition-colors">
                  {en.nav.reviews}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/admin`} className="hover:text-imperium-gold transition-colors text-neutral-500">
                  {en.nav.admin} Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm text-imperium-ivory uppercase tracking-wider">
              {en.footer.contactInfo}
            </h4>
            <div className="space-y-2.5 text-xs text-imperium-creamMuted">
              <a
                href={`tel:${businessConfig.restaurant.phone}`}
                className="flex items-center gap-2.5 hover:text-imperium-gold transition-colors"
              >
                <Phone className="w-4 h-4 text-imperium-gold shrink-0" />
                <span>{businessConfig.restaurant.phone}</span>
              </a>

              <a
                href={`mailto:${businessConfig.restaurant.email}`}
                className="flex items-center gap-2.5 hover:text-imperium-gold transition-colors"
              >
                <Mail className="w-4 h-4 text-imperium-gold shrink-0" />
                <span>{businessConfig.restaurant.email}</span>
              </a>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-imperium-gold shrink-0 mt-0.5" />
                <span>{businessConfig.restaurant.address}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 flex items-center gap-3">
              <a
                href={businessConfig.restaurant.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-imperium-gold hover:border-imperium-gold transition-colors"
                aria-label="IMPERIUM Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={businessConfig.restaurant.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-imperium-gold hover:border-imperium-gold transition-colors"
                aria-label="IMPERIUM Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>{en.footer.copyright}</p>
          <p className="text-[11px] text-neutral-500">{en.footer.powered}</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
