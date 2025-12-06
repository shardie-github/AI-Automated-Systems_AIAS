import { z } from "zod";

/**
 * Shared content schemas for both AIAS and Settler.dev
 */

// CTA (Call-to-Action) schema
export const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().refine(
    (val) => {
      // Allow absolute URLs, paths starting with /, or hash links starting with #
      if (val.startsWith("/") || val.startsWith("#")) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid url" }
  ),
  variant: z.enum(["default", "outline", "secondary", "ghost"]).optional(),
  visible: z.boolean().default(true),
});

export type CTA = z.infer<typeof ctaSchema>;

// Hero section schema
export const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  badgeText: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  imageUrl: z.string().url().optional(),
  backgroundVariant: z.enum(["light", "dark", "gradient"]).default("gradient"),
  socialProof: z
    .array(
      z.object({
        icon: z.string().optional(),
        text: z.string(),
      })
    )
    .optional(),
  trustBadges: z
    .array(
      z.object({
        icon: z.string().optional(),
        text: z.string(),
        color: z.string().optional(),
      })
    )
    .optional(),
});

export type Hero = z.infer<typeof heroSchema>;

// Feature item schema
export const featureItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
  gradient: z.string().optional(),
  highlight: z.boolean().default(false),
});

export type FeatureItem = z.infer<typeof featureItemSchema>;

// Feature section schema
export const featureSectionSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionSubtitle: z.string().optional(),
  items: z.array(featureItemSchema).min(1),
  layoutVariant: z.enum(["grid", "list", "bento"]).default("grid"),
});

export type FeatureSection = z.infer<typeof featureSectionSchema>;

// Testimonial schema
export const testimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  flag: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  hasVideo: z.boolean().default(false),
  type: z.enum(["consultancy", "platform"]).optional(),
  avatarUrl: z.string().url().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Testimonial section schema
export const testimonialSectionSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionSubtitle: z.string().optional(),
  items: z.array(testimonialSchema).min(1),
});

export type TestimonialSection = z.infer<typeof testimonialSectionSchema>;

// FAQ item schema
export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export type FAQItem = z.infer<typeof faqItemSchema>;

// FAQ category schema
export const faqCategorySchema = z.object({
  category: z.string().min(1),
  questions: z.array(faqItemSchema).min(1),
});

export type FAQCategory = z.infer<typeof faqCategorySchema>;

// FAQ section schema
export const faqSectionSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionSubtitle: z.string().optional(),
  categories: z.array(faqCategorySchema).min(1),
});

export type FAQSection = z.infer<typeof faqSectionSchema>;

// Use case schema (for Settler)
export const useCaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export type UseCase = z.infer<typeof useCaseSchema>;

// AIAS Content Schema
export const aiasContentSchema = z.object({
  hero: heroSchema,
  features: featureSectionSchema,
  testimonials: testimonialSectionSchema,
  faq: faqSectionSchema,
  footer: z
    .object({
      description: z.string().optional(),
      links: z
        .array(
          z.object({
            title: z.string(),
            links: z.array(
              z.object({
                href: z.string(),
                label: z.string(),
              })
            ),
          })
        )
        .optional(),
    })
    .optional(),
});

export type AIASContent = z.infer<typeof aiasContentSchema>;

// Settler Content Schema
export const settlerContentSchema = z.object({
  hero: heroSchema,
  features: featureSectionSchema,
  useCases: z.array(useCaseSchema).optional(),
  partnership: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      whyItems: z
        .array(
          z.object({
            text: z.string(),
            icon: z.string().optional(),
          })
        )
        .optional(),
      synergyItems: z
        .array(
          z.object({
            text: z.string(),
            icon: z.string().optional(),
          })
        )
        .optional(),
      ctas: z.array(ctaSchema).optional(),
    })
    .optional(),
  cta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      ctas: z.array(ctaSchema).optional(),
    })
    .optional(),
});

export type SettlerContent = z.infer<typeof settlerContentSchema>;
