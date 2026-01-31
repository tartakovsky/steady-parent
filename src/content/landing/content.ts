import {
  Shield,
  Zap,
  RotateCcw,
} from "lucide-react";

import type {
  HeroContent,
  RecognitionContent,
  PossibilityContent,
  SolutionContent,
  PromiseContent,
  CurriculumContent,
  ProductContent,
  AuthorityContent,
  TestimonialsContent,
  MarqueeTestimonialsContent,
  TrustBadgesContent,
  FaqContent,
  LeadMagnetContent,
} from "@/content/landing/types";

const R2_PUBLIC_BASE_URL: string | undefined =
  process.env["NEXT_PUBLIC_R2_PUBLIC_BASE_URL"];

function r2Url(path: string): string {
  if (typeof R2_PUBLIC_BASE_URL === "string" && R2_PUBLIC_BASE_URL.length > 0) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  return path;
}

export interface LandingContent {
  hero: HeroContent;
  recognition: RecognitionContent;
  possibility: PossibilityContent;
  solution: SolutionContent;
  promise: PromiseContent;
  curriculum: CurriculumContent;
  product: ProductContent;
  authority: AuthorityContent;
  marqueeTestimonials: MarqueeTestimonialsContent;
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
  solution: {
    eyebrow: "The method",
    title: "A simple system you can run under stress",
    body:
      "You do not need more willpower. You need a repeatable sequence for the moment, the boundary, and the repair. The Steady Parent Method gives you scripts and steps you can use when everyone is escalated.",
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
    eyebrow: "What's inside",
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
    title: "The Steady Parent Course",
    body:
      "10 illustrated lessons with narrated audio, plus live cohort support and lifetime community access.",
    priceCurrent: "$99",
    priceOriginal: "$120",
    discountPercent: "-18%",
    buyCta: {
      label: "Reserve your seat",
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
          "10 illustrated lessons with audio walkthroughs, plus short scripts and 1-minute mental and body practices you can use immediately.",
      },
      {
        title: "Who it is for",
        body:
          "Parents and caregivers of kids 3-9 who want calm, firm boundaries without yelling or caving.",
      },
      {
        title: "Cohort timeline",
        body:
          "Cohort 3 runs Mar 1 to Apr 1. Suggested weekly schedule, do lessons anytime. Get onboarding email and prep checklist right after joining.",
      },
    ],
  },
  authority: {
    eyebrow: "It's evidence-based",
    title: "Grounded in child development research",
    body:
      "We studied leading researchers and clinicians, adjusted for realities of life, and turned their insights into a short, actionable system",
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
  marqueeTestimonials: {
    title: "Parents say",
    row1: [
      {
        name: "Keisha",
        eyebrow: "Mom of three under 10",
        text: "It's about me too, not just kids.",
        stars: 5,
      },
      {
        name: "Jake",
        eyebrow: "Dad",
        text: "My parents yelled, and I turned out fine. Don't spoil them.",
        stars: 2,
      },
      {
        name: "Tanya",
        eyebrow: "Kindergarten teacher",
        text: "Works when you handle 20 kids.",
        stars: 5,
      },
      {
        name: "Lisa",
        eyebrow: "Mom of a 13-year-old",
        text: "Great approach but my kid's a teen now. Wish I found it earlier.",
        stars: 4,
      },
      {
        name: "Laura",
        eyebrow: "Nanny for two families",
        text: "Explains the why, not just how.",
        stars: 5,
      },
      {
        name: "Raj",
        eyebrow: "Father of a 4-year-old son",
        text: "Science, but adapted to life.",
        stars: 4.5,
      },
      {
        name: "Jason",
        eyebrow: "Divorced dad, shared custody",
        text: "Short enough for my schedule.",
        stars: 5,
      },
      {
        name: "Mary",
        eyebrow: "Mom of two boys",
        text: "Kids need discipline, not feelings talks. Soft generation.",
        stars: 1,
      },
      {
        name: "Sarah",
        eyebrow: "Mom of a 5-year-old",
        text: "Finally I get why I snap.",
        stars: 5,
      },
      {
        name: "Mei-Lin",
        eyebrow: "Single mom of a 6-year-old",
        text: "The body exercises calm me down.",
        stars: 5,
      },
    ],
    row2: [
      {
        name: "Michelle",
        eyebrow: "Stepmom to a 7-year-old",
        text: "Helped me stop taking it personal.",
        stars: 5,
      },
      {
        name: "Tom",
        eyebrow: "Dad of an 18-month-old",
        text: "Solid stuff. Mine's too young for most of it yet.",
        stars: 4,
      },
      {
        name: "Stephanie",
        eyebrow: "Grandma raising grandson",
        text: "Wish I had this 30 years ago.",
        stars: 5,
      },
      {
        name: "Amber",
        eyebrow: "Homeschool mom",
        text: "Solid content. Wish it was on Skool though. (It is now!)",
        stars: 4.5,
      },
      {
        name: "Nicole",
        eyebrow: "Foster mom",
        text: "Trauma-aware without being complicated.",
        stars: 5,
      },
      {
        name: "Steve",
        eyebrow: "Dad of a 6-year-old",
        text: "My kid needs to know who's boss. Not this.",
        stars: 1,
      },
      {
        name: "Elena",
        eyebrow: "Daycare provider",
        text: "Practical for when you're outnumbered.",
        stars: 5,
      },
      {
        name: "Beth",
        eyebrow: "Pediatric occupational therapist",
        text: "Aligns with what I tell parents.",
        stars: 5,
      },
    ],
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What parents are saying",
    body:
      "Swipe through reels and comments from parents using the Steady Parent method in everyday moments.",
    cards: [
      {
        id: "steady-parent-feedback-1",
        title: "Danielle",
        subtitle: "Mom of two boys (6 and 9)",
        body: "Finally understand why I lose it. Less of a mess now.",
        media: {
          kind: "video",
          src: r2Url("steady_parent_feedback_1.mp4"),
          poster: r2Url("steady_parent_feedback_1_cover.jpeg"),
        },
      },
      {
        id: "steady-parent-feedback-2",
        title: "Ashley",
        subtitle: "Mom of a strong-willed 4-year-old",
        body:
          "Gentle parenting never stuck. This one did. Regulate yourself first is a game changer.",
        media: {
          kind: "video",
          src: r2Url("steady_parent_feedback_2.mp4"),
          poster: r2Url("steady_parent_feedback_2_cover.jpeg"),
        },
      },
      {
        id: "steady-parent-feedback-3",
        title: "Kristin",
        subtitle: "Stepmom to a 5-year-old",
        body: "Not a course person. But it’s bite-sized enough to do it on lunch breaks.",
        media: {
          kind: "video",
          src: r2Url("steady_parent_feedback_3.mp4"),
          poster: r2Url("steady_parent_feedback_3_cover.jpeg"),
        },
      },
      {
        id: "sdp-brittany-feedback-blurred",
        variant: "mediaOnly",
        title: "Brittany",
        subtitle: "Feedback screenshot",
        body: "Feedback screenshot from Brittany.",
        media: {
          kind: "image",
          src: r2Url("sdp_brittany_feedback_blurred.png"),
          alt: "Blurred feedback screenshot from Brittany",
        },
      },
      {
        id: "sdp-megan-feedback-blurred",
        variant: "mediaOnly",
        title: "Megan",
        subtitle: "Feedback screenshot",
        body: "Feedback screenshot from Megan.",
        media: {
          kind: "image",
          src: r2Url("sdp_megan_feedback_blurred.png"),
          alt: "Blurred feedback screenshot from Megan",
        },
      },
    ],
  },
  trustBadges: {
    items: [
      {
        icon: RotateCcw,
        title: "Refund until March 7",
        body: "Full refund until March 7 (a week after the cohort starts). Credit toward the next cohort after. Use the refund form to submit refund requests.",
      },
      {
        icon: Zap,
        title: "Instant Access",
        body: "Start learning right away with immediate digital access.",
      },
      {
        icon: Shield,
        title: "Secure Checkout",
        body: "Powered by Lemon Squeezy (Stripe). HTTPS encrypted. We never see your card details",
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
            question: "What is the refund policy?",
            answer:
              "Full refund until March 7 (a week after the cohort starts). Credit towards the next cohort after. Use the refund form to submit refund requests.",
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
    eyebrow: "Not ready for a course yet?",
    title: "Get the Tantrum Reset cheat sheet",
    body: "A 60-second reset you can use mid-tantrum. What to say, what to do, and what to avoid.",
    inputPlaceholder: "Email address",
    buttonLabel: "Send me the sheet",
  },
};
