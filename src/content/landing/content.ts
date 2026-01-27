import {
  Shield,
  Zap,
  RotateCcw,
} from "lucide-react";

import type {
  HeroContent,
  RecognitionContent,
  PossibilityContent,
  PromiseContent,
  CurriculumContent,
  ProductContent,
  AuthorityContent,
  TestimonialsContent,
  TrustBadgesContent,
  FaqContent,
  LeadMagnetContent,
} from "@/content/landing/types";

export interface LandingContent {
  hero: HeroContent;
  recognition: RecognitionContent;
  possibility: PossibilityContent;
  promise: PromiseContent;
  curriculum: CurriculumContent;
  product: ProductContent;
  authority: AuthorityContent;
  testimonials: TestimonialsContent;
  trustBadges: TrustBadgesContent;
  faq: FaqContent;
  leadMagnet: LeadMagnetContent;
}

export const landingContent: LandingContent = {
  hero: {
    badge: {
      label: "Cohort 3",
      detail: "Applications open",
    },
    eyebrow: "If ‘stay calm’ worked, you’d be calm.",
    title: "The Steady Parent Method",
    body:
      "A system for parenting without losing it. Get:",
    bullets: [
      "Fewer blowups",
      "Firm boundaries",
      "A kid who still wants you",
    ],
    primaryCta: {
      label: "Apply to join Cohort 3",
      href: "#waitlist",
    },
    secondaryCta: {
      label: "Get free guide",
      href: "#free-guide",
    },
    imageUrl: "/landing/hero/hero.png",
    imageAlt: "",
  },
  recognition: {
    eyebrow: "Sound familiar?",
    title: "You know what to do, then it falls apart",
    body:
      "You try to stay calm, then the yelling starts and the guilt hits. You are not broken. You just need a system that works under stress.",
    bullets: [
      "Yelling when you are tired",
      "Kids ignore requests",
      "Boundaries do not stick",
    ],
    imageUrl: "https://ui.shadcn.com/placeholder.svg",
    imageAlt: "Parent reflecting after a tough moment",
  },
  possibility: {
    eyebrow: "What if",
    title: "Your child calms faster and you stay steady",
  },
  promise: {
    eyebrow: "What you get",
    title: "A clear path for real life moments",
    body:
      "Ten short lessons that map the moment, the script, and the repair so you can stay firm and warm.",
    bullets: [
      "10 lessons, 7 minutes",
      "Audio and text lessons",
      "Cohort support in Skool",
    ],
    imageUrl: "https://ui.shadcn.com/placeholder.svg",
    imageAlt: "Course lessons on a phone and laptop",
  },
  curriculum: {
    eyebrow: "Curriculum",
    title: "Ten lessons you can use today",
    body:
      "Each lesson is about 7 minutes of audio plus the written version. Start anywhere, then use the sequence in real moments.",
    lessons: [
      {
        title: "Why gentle parenting fails in real life",
        body:
          "Teaches: What gentle parenting gets right, what it gets wrong, and why “just stay calm” is useless advice when your kid is escalating and you’re at your limit. Outcome: You get a reality-based framework that reduces blowups and power struggles without guilt, bribery, or fear.",
      },
      {
        title: "Real reasons you yell (and what to do about it, not “try harder”)",
        body:
          "Teaches: The real triggers behind yelling (overload, threat response, resentment, no support, sleep, sensory stress). How to identify your personal “snap point” and build a preloaded script + action that prevents the blowup before it starts. Outcome: Fewer blowups, shorter fights, and a home where you don’t have to be calm all day to be a good parent.",
      },
      {
        title: "How to deal with their big emotions (without letting them run the house)",
        body:
          "Teaches: The line between support and surrender, what to do when they’re dysregulated, and what not to do that accidentally rewards escalation. Outcome: Meltdowns shrink over time because your kid feels understood and learns the boundary still stands.",
      },
      {
        title: "Regulate, relate, reason (adjusted for real life)",
        body:
          "Teaches: How to use regulation and connection without turning it into a drawn-out therapy session or a reward for bad behavior. Outcome: You stay in charge while staying calm enough to actually be effective.",
      },
      {
        title: "Boundaries that actually work (not doormat, not tyrant)",
        body:
          "Teaches: The “missing piece” that makes boundaries stick, what you control, what they control, and how to follow through without escalating. Outcome: You stop caving or overcorrecting, and your home feels more predictable and respectful.",
      },
      {
        title: "Why they don’t listen (and how to fix it)",
        body:
          "Teaches: The real reasons “they ignore me” happens (attention, overload, autonomy, incentives, inconsistency) and how to remove the blockers to follow-through. Outcome: You repeat yourself less and they comply faster, with less friction and fewer battles.",
      },
      {
        title: "How to deal with backtalk, lying, and pushback",
        body:
          "Teaches: What backtalk, lying, and pushback are actually trying to accomplish for a kid, and how to respond in a way that shuts down the behavior without humiliating them. Outcome: Less disrespect, fewer arguments, and a kid who trusts you enough to tell the truth.",
      },
      {
        title: "How to teach consequences (without punishment)",
        body:
          "Teaches: How to stop inventing consequences and start using real-life cause and effect, so discipline isn’t “I’m taking something away,” it’s “this is what happens when.” Outcome: They learn responsibility without resentment, and you stop playing consequence police.",
      },
      {
        title: "Build their self-worth without spoiling them",
        body:
          "Teaches: What “healthy self-worth” actually looks like in behavior, and how to talk to kids so they develop grit instead of entitlement. Outcome: A kid who tries, learns, and recovers. More resilience, less people-pleasing, less giving up.",
      },
      {
        title: "Keep their trust and love as they grow up (so they don’t pull away)",
        body:
          "Teaches: What makes kids emotionally detach, fear, resentment, distrust, and being tired of you, and what to change so you stop causing that damage. Outcome: Your kid keeps coming back to you and keeps talking to you as they grow. They keep wanting you in their life.",
      },
    ],
  },
  product: {
    title: "Text plus audio course on Skool",
    body:
      "Ten lessons with 11labs narration, community access forever, and live cohort support.",
    priceCurrent: "$99",
    priceOriginal: "$120",
    discountPercent: "-18%",
    buyCta: {
      label: "Join cohort",
      href: "#waitlist",
    },
    imageUrls: [
      "https://ui.shadcn.com/placeholder.svg",
      "https://ui.shadcn.com/placeholder.svg",
      "https://ui.shadcn.com/placeholder.svg",
      "https://ui.shadcn.com/placeholder.svg",
      "https://ui.shadcn.com/placeholder.svg",
      "https://ui.shadcn.com/placeholder.svg",
    ],
    accordions: [
      {
        title: "What is inside",
        body:
          "Ten lessons, each paired with a 7 minute audio narration and practical scripts you can use right away.",
      },
      {
        title: "Who it is for",
        body:
          "Parents and caregivers who want calm boundaries, fewer blow ups, and kids who listen without fear.",
      },
      {
        title: "Cohort timeline",
        body:
          "Cohort 3 starts March 1. Join the waitlist to get access and reminders.",
      },
    ],
  },
  authority: {
    eyebrow: "Authority",
    title: "Evidence-backed voices guiding the approach",
    body:
      "Learn from the researchers and clinicians whose work shapes how we build emotional regulation in children.",
    cards: [
      {
        id: "bruce-d-perry",
        title: "Bruce D. Perry",
        subtitle: "M.D., Ph.D. in Neuroscience",
        body:
          'Psychiatrist behind the neurosequential model and the critical "Regulate, Relate, Reason" sequence used to connect with distressed children.',
        imageUrl:
          "/landing/authority/tild6236-3232-4738-a139-333763343163__bruce_d_perry_md_phd.png",
        imageAlt: "Bruce D. Perry",
      },
      {
        id: "daniel-siegel-tina-payne-bryson",
        title: "Daniel Siegel & Tina Payne Bryson",
        subtitle: "M.D. in Psychiatry & Ph.D. in Social Work",
        body:
          "Authors of The Whole-Brain Child, providing foundational strategies for integrating logic and emotion to nurture developing minds.",
        imageUrl:
          "/landing/authority/tild3666-3839-4532-b566-353562373437__frame_278.png",
        imageAlt: "Daniel Siegel and Tina Payne Bryson",
      },
      {
        id: "stephen-w-porges",
        title: "Stephen W. Porges",
        subtitle: "Ph.D. in Psychophysiology",
        body:
          "Creator of Polyvagal Theory, identifying the distinct nervous system states of safety, fight/flight mobilization, and shutdown.",
        imageUrl:
          "/landing/authority/tild3434-3836-4434-a638-633934616332__stephen_w_porges_phd.png",
        imageAlt: "Stephen W. Porges",
      },
      {
        id: "adele-diamond",
        title: "Adele Diamond",
        subtitle: "Ph.D. in Developmental Cognitive Neuroscience",
        body:
          "Neuroscientist specializing in executive functions, defining the biological developmental limits of impulse control and reasoning in young children.",
        imageUrl:
          "/landing/authority/tild3565-6664-4666-a330-643038313164__dr_adele_diamond_phd.png",
        imageAlt: "Adele Diamond",
      },
      {
        id: "bruce-e-compas",
        title: "Bruce E. Compas",
        subtitle: "Ph.D. in Clinical Psychology",
        body:
          "Researcher on coping styles, distinguishing between helpful regulation and harmful strategies like suppression, avoidance, and rumination.",
        imageUrl:
          "/landing/authority/tild6531-3435-4265-b036-333135333861__bruce_e_compas_phd.png",
        imageAlt: "Bruce E. Compas",
      },
      {
        id: "john-bowlby",
        title: "John Bowlby",
        subtitle: "M.D. in Psychiatry",
        body:
          "The father of attachment theory, establishing that secure emotional bonds are the absolute prerequisite for independent emotional regulation.",
        imageUrl:
          "/landing/authority/tild6430-3366-4265-b531-356564313762__john_bowlby_md.png",
        imageAlt: "John Bowlby",
      },
    ],
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "Real stories from parents and educators",
    body:
      "Swipe through reels and snapshots from people applying the frameworks in everyday moments.",
    cards: [
      {
        id: "reel-1",
        title: "Arielle M.",
        subtitle: "Parent of a 6-year-old",
        body:
          "The strategies finally clicked. Our mornings are calmer and our evenings feel connected again.",
        media: {
          kind: "video",
          src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          poster: "https://ui.shadcn.com/placeholder.svg",
        },
      },
      {
        id: "reel-2",
        title: "Marcus T.",
        subtitle: "Elementary educator",
        body:
          "I can see the difference when kids regulate first. The tools are practical and quick to apply.",
        media: {
          kind: "video",
          src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          poster: "https://ui.shadcn.com/placeholder.svg",
        },
      },
      {
        id: "image-1",
        title: "Sofia R.",
        subtitle: "Caregiver",
        body:
          "I used to feel stuck in the moment. Now I have a simple sequence I can trust.",
        media: {
          kind: "image",
          src: "https://ui.shadcn.com/placeholder.svg",
          alt: "Testimonial snapshot",
        },
      },
    ],
  },
  trustBadges: {
    items: [
      {
        icon: RotateCcw,
        title: "30-Day Money Back",
        body: "Try it for 30 days. Full refund if it is not right.",
      },
      {
        icon: Zap,
        title: "Instant Access",
        body: "Start learning right away with immediate digital access.",
      },
      {
        icon: Shield,
        title: "Secure Checkout",
        body: "Encrypted payments with trusted checkout providers.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions parents ask first",
    body:
      "Clear answers so you know exactly what you are getting before you join.",
    sections: [
      {
        title: "Course",
        items: [
          {
            question: "How long is each lesson?",
            answer: "Each lesson is about 7 minutes of audio plus text.",
          },
          {
            question: "Is this gentle parenting?",
            answer:
              "It is calm and firm. You will learn boundaries that work without shame.",
          },
          {
            question: "Do I need to start at lesson one?",
            answer:
              "Start anywhere, but the first two lessons build the foundation.",
          },
        ],
      },
      {
        title: "Access",
        items: [
          {
            question: "Where is the course hosted?",
            answer: "All lessons are inside Skool with audio and text.",
          },
          {
            question: "Do I keep community access?",
            answer: "Yes, community access is included forever.",
          },
          {
            question: "Can I join at the member price?",
            answer: "Paid community members get the $69 price automatically.",
          },
        ],
      },
    ],
  },
  leadMagnet: {
    eyebrow: "Free guide",
    title: "Get the tantrum reset plan",
    body: "A short checklist for calm, firm responses in the moment.",
    inputPlaceholder: "Email address",
    buttonLabel: "Send guide",
  },
};
