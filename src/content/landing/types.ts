import type { LucideIcon } from "lucide-react";

export interface HeroBadgeContent {
  /** Short bold label, max 3 words. */
  label: string;
  /** Supporting text, max 4 words. */
  detail: string;
}

export interface HeroCta {
  /** Button label, max 4 words. */
  label: string;
  /** Destination URL. */
  href: string;
}

export interface HeroContent {
  /** Main eyebrow badge content. */
  badge: HeroBadgeContent;
  /** Eyebrow text, max 10 words. */
  eyebrow: string;
  /** Hero headline, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Optional bullet list. */
  bullets: readonly string[];
  /** Primary CTA. */
  primaryCta: HeroCta;
  /** Secondary CTA. */
  secondaryCta: HeroCta;
  /** Optional hero image URL. */
  imageUrl?: string;
  /** Image alt text. */
  imageAlt: string;
}

export interface RecognitionContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Optional bullet list. */
  bullets: readonly string[];
  /** Optional image URL. */
  imageUrl?: string;
  /** Image alt text. */
  imageAlt: string;
}

export interface PossibilityContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
}

export interface SolutionContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
}

export interface CommunityContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Left list title. */
  leftListTitle: string;
  /** Left list items. */
  leftListItems: readonly string[];
  /** Right list title. */
  rightListTitle: string;
  /** Right list items. */
  rightListItems: readonly string[];
  /** Footer supporting text. */
  footer: string;
  /** CTA button label + destination. */
  cta: HeroCta;
}

export interface PromiseContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Optional bullet list. */
  bullets: readonly string[];
  /** Optional image URL. */
  imageUrl?: string;
  /** Image alt text. */
  imageAlt: string;
}

export interface CurriculumLessonItem {
  /** Lesson title, max 10 words. */
  title: string;
  /** Lesson description. Keep to 1-2 short sentences. */
  body: string;
}

export interface CurriculumContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Exactly ten lessons. */
  lessons: [
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
    CurriculumLessonItem,
  ];
}

export interface ProductAccordionItem {
  /** Accordion title, max 6 words. */
  title: string;
  /** Accordion body copy. */
  body: string;
}

export interface ProductCta {
  /** Button label, max 4 words. */
  label: string;
  /** Destination URL. */
  href: string;
}

export interface ProductContent {
  /** Product title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Price after discount (display). */
  priceCurrent: string;
  /** Price before discount (display). */
  priceOriginal: string;
  /** Discount percentage (display). */
  discountPercent: string;
  /** Buy button label + destination. */
  buyCta: ProductCta;
  /** Exactly six image URLs. */
  imageUrls: [string, string, string, string, string, string];
  /** Exactly three accordion sections. */
  accordions: [ProductAccordionItem, ProductAccordionItem, ProductAccordionItem];
}

export interface AuthorityCard {
  /** Unique identifier for carousel items. */
  id: string;
  /** Person name. */
  title: string;
  /** Credential line. */
  subtitle: string;
  /** Supporting description. */
  body: string;
  /** Avatar image URL. */
  imageUrl: string;
  /** Avatar alt text. */
  imageAlt: string;
}

export interface AuthorityContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** List of authority cards. */
  cards: readonly AuthorityCard[];
  /** Footer disclaimer text. */
  footer: string;
}

export type TestimonialMedia =
  // `poster` is the preview image shown before playback starts.
  | { kind: "video"; src: string; poster: string }
  | { kind: "image"; src: string; alt: string };

export interface TestimonialItem {
  /** Unique identifier for carousel items. */
  id: string;
  /**
   * Rendering variant for the testimonials carousel.
   * - default: media + text
   * - mediaOnly: media fills the entire card (no text)
   */
  variant?: "default" | "mediaOnly";
  /** Card title, max 8 words. */
  title: string;
  /** Card subtitle, max 8 words. */
  subtitle: string;
  /** Body copy. */
  body: string;
  /** Media payload (image or video). */
  media: TestimonialMedia;
}

export interface TestimonialsContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Testimonial cards. */
  cards: readonly TestimonialItem[];
}

export interface MarqueeTestimonialItem {
  /** Person name. */
  name: string;
  /** Small eyebrow text (e.g. "Parent of 2"). */
  eyebrow: string;
  /** Quote text. */
  text: string;
  /** Star rating (0.5–5.0 in 0.5 steps). */
  stars:
    | 0.5
    | 1
    | 1.5
    | 2
    | 2.5
    | 3
    | 3.5
    | 4
    | 4.5
    | 5;
}

export interface MarqueeTestimonialsContent {
  /** Section title. */
  title: string;
  /** First row items (scrolls left). */
  row1: readonly MarqueeTestimonialItem[];
  /** Second row items (scrolls right). */
  row2: readonly MarqueeTestimonialItem[];
}

export interface TrustBadgeItem {
  /** Icon component or URL. */
  icon: LucideIcon | string;
  /** Item title, max 6 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
}

export interface TrustBadgesContent {
  /** List of trust items. */
  items: readonly TrustBadgeItem[];
}

export interface FaqItem {
  /** Question text, max 12 words. */
  question: string;
  /** Answer text. */
  answer: string;
}

export interface FaqSectionGroup {
  /** Group title. */
  title: string;
  /** FAQ items within the group. */
  items: readonly FaqItem[];
}

export interface FaqContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** FAQ groups. */
  sections: readonly FaqSectionGroup[];
}

export interface LeadMagnetContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Input placeholder text. */
  inputPlaceholder: string;
  /** Button label, max 4 words. */
  buttonLabel: string;
}
