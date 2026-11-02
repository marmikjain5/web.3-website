export interface SocialChannel {
  id: "instagram" | "whatsapp" | "linkedin" | "contact";
  name: string;
  href: string;
  label: string;
}

export const OFFICIAL_CLUB_SOCIALS: readonly SocialChannel[] = [
  {
    id: "instagram",
    name: "Instagram",
    href: "https://www.instagram.com/web.3_bmsitm?rpxt=cjl6OGo1bmJ1NXpm",
    label: "Follow on Instagram",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Community",
    href: "https://chat.whatsapp.com/EbegnhR02cZIs3sf9Kq0Jq",
    label: "Join WhatsApp Community",
  },
  {
    id: "contact",
    name: "Contact Us",
    href: "/contact",
    label: "Contact WEB.3",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/web3-club-%E2%80%93-bmsit-m/home/",
    label: "Connect on LinkedIn",
  },
] as const;

export const SOCIAL_URLS = {
  instagram: OFFICIAL_CLUB_SOCIALS[0].href,
  whatsapp: OFFICIAL_CLUB_SOCIALS[1].href,
  contact: OFFICIAL_CLUB_SOCIALS[2].href,
  linkedin: OFFICIAL_CLUB_SOCIALS[3].href,
} as const;

