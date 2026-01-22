export interface AuthorityItem {
  id: string;
  name: string;
  credentials: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export type TestimonialMedia =
  | { kind: "video"; src: string; aspectRatio: "9:16" | "16:9" | "4:3"; posterSrc?: string }
  | { kind: "image"; src: string; alt: string; aspectRatio?: "3:4" | "1:1" | "4:3" | "16:9" }
  | { kind: "none" };

export interface TestimonialItem {
  id: string;
  personName: string;
  personTitle?: string;
  quote?: string;
  media: TestimonialMedia;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const landingContent = {
  cohort: {
    courseName: "Big Emotions Course",
    startDateLabel: "Starts March 1st",
    priceUsd: 99,
    communityValueLabel: "Includes community access (worth $120 per year)",
    primaryCtaLabel: "Join the waitlist",
    primaryCtaUrl: "https://example.com/waitlist",
  },
  hero: {
    headline: "The step by step plan for big emotions",
    subheadline:
      "A cohort based course for parents of kids ages 3 to 7, plus community access inside Skool.",
    primaryCtaLabel: "Join the waitlist",
    secondaryCtaLabel: "See what is inside",
    trustBullets: [
      "Cohort starts March 1st",
      "Community access included",
      "Simple actions you can use in the moment",
    ],
  },
  recognition: {
    eyebrow: "Recognition + permission",
    title: "If this feels familiar, you are not alone",
    bullets: [
      "The meltdown over the wrong cup",
      "The screaming that nothing stops",
      "The guilt after you lose it",
    ],
    close:
      "It is not because you are failing. Most parenting tools were not designed for this moment.",
  },
  possibility: {
    eyebrow: "Possibility",
    title: "What if the next meltdown looked different",
    bullets: [
      "You stay calm enough to lead",
      "Your child feels safe enough to come down",
      "You know what to do next, even when you are tired",
    ],
  },
  promise: {
    eyebrow: "Promise of the solution",
    title: "A science based approach made practical",
    bullets: [
      "Short lessons with scripts you can use immediately",
      "A simple sequence to use during big emotions",
      "A plan that fits real life, not perfect days",
    ],
  },
  authority: [
    {
      id: "bruce-perry",
      name: "Bruce D. Perry",
      credentials: "M.D., Ph.D. in Neuroscience",
      description:
        "Psychiatrist behind the neurosequential model and the critical \"Regulate, Relate, Reason\" sequence used to connect with distressed children.",
      imageSrc: "/landing/authority/tild6236-3232-4738-a139-333763343163__bruce_d_perry_md_phd.png",
      imageAlt: "Portrait of Bruce D. Perry",
    },
    {
      id: "dan-siegel-tina-bryson",
      name: "Daniel Siegel & Tina Payne Bryson",
      credentials: "M.D. in Psychiatry & Ph.D. in Social Work",
      description:
        "Authors of The Whole-Brain Child, providing foundational strategies for integrating logic and emotion to nurture developing minds.",
      imageSrc: "/landing/authority/tild3666-3839-4532-b566-353562373437__frame_278.png",
      imageAlt: "Portraits of Daniel Siegel and Tina Payne Bryson",
    },
    {
      id: "stephen-porges",
      name: "Stephen W. Porges",
      credentials: "Ph.D. in Psychophysiology",
      description:
        "Creator of Polyvagal Theory, identifying the distinct nervous system states of safety, fight/flight mobilization, and shutdown.",
      imageSrc: "/landing/authority/tild3434-3836-4434-a638-633934616332__stephen_w_porges_phd.png",
      imageAlt: "Portrait of Stephen W. Porges",
    },
    {
      id: "adele-diamond",
      name: "Adele Diamond",
      credentials: "Ph.D. in Developmental Cognitive Neuroscience",
      description:
        "Neuroscientist specializing in executive functions, defining the biological developmental limits of impulse control and reasoning in young children.",
      imageSrc: "/landing/authority/tild3565-6664-4666-a330-643038313164__dr_adele_diamond_phd.png",
      imageAlt: "Portrait of Adele Diamond",
    },
    {
      id: "bruce-compas",
      name: "Bruce E. Compas",
      credentials: "Ph.D. in Clinical Psychology",
      description:
        "Researcher on coping styles, distinguishing between helpful regulation and harmful strategies like suppression, avoidance, and rumination.",
      imageSrc: "/landing/authority/tild6531-3435-4265-b036-333135333861__bruce_e_compas_phd.png",
      imageAlt: "Portrait of Bruce E. Compas",
    },
    {
      id: "john-bowlby",
      name: "John Bowlby",
      credentials: "M.D. in Psychiatry",
      description:
        "The father of attachment theory, establishing that secure emotional bonds are the absolute prerequisite for independent emotional regulation.",
      imageSrc: "/landing/authority/tild6430-3366-4265-b531-356564313762__john_bowlby_md.png",
      imageAlt: "Portrait of John Bowlby",
    },
  ] satisfies AuthorityItem[],
  testimonials: [
    {
      id: "testimonial-1",
      personName: "Parent of a 5 year old",
      quote:
        "We went from daily meltdowns to having a plan. The steps are simple and actually work in the moment.",
      media: {
        kind: "video",
        src: "/landing/testimonials/video-1.mp4",
        aspectRatio: "9:16",
        posterSrc: "/landing/testimonials/video-1-poster.jpg",
      },
    },
    {
      id: "testimonial-2",
      personName: "Parent of a 6 year old",
      quote:
        "The biggest change was how fast we could recover. Less chaos, fewer power struggles, and a calmer bedtime.",
      media: {
        kind: "video",
        src: "/landing/testimonials/video-2.mp4",
        aspectRatio: "9:16",
        posterSrc: "/landing/testimonials/video-2-poster.jpg",
      },
    },
  ] satisfies TestimonialItem[],
  faq: [
    {
      id: "faq-age",
      question: "What age is this for?",
      answer: "Designed for ages 3 to 7. It can still help outside that range.",
    },
    {
      id: "faq-format",
      question: "Is this a course or a PDF?",
      answer:
        "This is a cohort based course delivered in Skool, and it includes community access.",
    },
    {
      id: "faq-nd",
      question: "Will this work for a neurodivergent child?",
      answer:
        "Many parents report it helps, but every child is different. The goal is fewer power struggles and clearer next steps.",
    },
  ] satisfies FaqItem[],
  leadMagnet: {
    title: "Not ready for the full course?",
    description: "Get the free 3 step meltdown cheat sheet.",
    submitLabel: "Get the cheat sheet",
    formActionUrl: "https://example.com/freebie",
  },
} as const;

