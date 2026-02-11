import type { z } from "zod/v4";

import type { KitIntegrationSpecSchema } from "../schemas/kit-integration";
import type { MailingTagTaxonomySchema, FormTagMappingsSchema, QuizTaxonomySchema } from "../schemas/index";

type KitIntegrationSpec = z.infer<typeof KitIntegrationSpecSchema>;
type MailingTag = z.infer<typeof MailingTagTaxonomySchema>[number];
type FormTagMapping = z.infer<typeof FormTagMappingsSchema>[number];
type QuizTaxonomy = z.infer<typeof QuizTaxonomySchema>;

// ---------------------------------------------------------------------------
// Check result — structured for admin UI display
// ---------------------------------------------------------------------------

export interface IntegrationCheck {
  label: string;
  status: "pass" | "fail" | "warn";
  detail?: string | undefined;
}

export interface IntegrationValidationResult {
  errors: string[];
  warnings: string[];
  checks: IntegrationCheck[];
}

// ---------------------------------------------------------------------------
// Live Kit state (provided by caller — admin API fetches this)
// ---------------------------------------------------------------------------

export interface LiveKitState {
  customFields: string[];
  forms: { id: number; name: string }[];
  tags: { id: number; name: string; subscriberCount: number }[];
}

// ---------------------------------------------------------------------------
// Code checks (provided by caller — admin API does fs checks)
// ---------------------------------------------------------------------------

export interface CodeChecks {
  apiRouteResults: Record<string, boolean>;
  frontendResults: Record<string, { exists: boolean; hasPatterns: boolean; missingPatterns: string[] }>;
}

// ---------------------------------------------------------------------------
// Offline-only validation (for CLI — no Kit API, no file system)
// ---------------------------------------------------------------------------

export function validateKitIntegrationOffline(
  spec: KitIntegrationSpec,
  mailingTags: MailingTag[],
  formTagMappings: FormTagMapping[],
  quizTaxonomy: QuizTaxonomy,
  kitTagConfig: Record<string, number>,
  categorySlugs?: string[],
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tagIdSet = new Set(mailingTags.map((t) => t.id));
  const formMappingIds = new Set(formTagMappings.map((m) => m.formId));

  // ===== Quiz checks =====

  const quizTagPrefix = spec.quizSubscribeFlow.tagPrefix;

  // A1: Every quiz in taxonomy has a form_tag_mapping entry
  for (const quiz of quizTaxonomy.entries) {
    const formId = `quiz/${quiz.slug}`;
    if (!formMappingIds.has(formId)) {
      errors.push(`Quiz "${quiz.slug}" has no form_tag_mapping entry (expected formId: "${formId}")`);
    }
  }

  // A2: Every quiz form_tag_mapping references valid mailing tags
  for (const mapping of formTagMappings) {
    if (!mapping.formId.startsWith("quiz/")) continue;
    for (const tagId of mapping.tagIds) {
      if (!tagIdSet.has(tagId)) {
        errors.push(`Form mapping "${mapping.formId}" references unknown tag "${tagId}"`);
      }
    }
  }

  // A3: Every quiz tag in mailing_tags has a matching kit-config entry
  const quizMailingTags = mailingTags.filter((t) => t.id.startsWith(quizTagPrefix));
  for (const tag of quizMailingTags) {
    if (!(tag.id in kitTagConfig)) {
      errors.push(`Mailing tag "${tag.id}" not found in kit-config.ts`);
    }
  }

  // A4: Tag IDs in mailing_tags match kit-config
  for (const tag of quizMailingTags) {
    const configId = kitTagConfig[tag.id];
    if (configId !== undefined && tag.kitTagId !== undefined && configId !== tag.kitTagId) {
      errors.push(
        `Tag "${tag.id}" ID mismatch: mailing_tags says ${tag.kitTagId}, kit-config says ${configId}`
      );
    }
  }

  // A5: Required quiz tags (e.g. "lead") exist in mailing_tags and kit-config
  for (const reqTag of spec.quizSubscribeFlow.requiredTags) {
    if (!tagIdSet.has(reqTag)) {
      errors.push(`Required quiz tag "${reqTag}" not found in mailing_tags.json`);
    }
    if (!(reqTag in kitTagConfig)) {
      errors.push(`Required quiz tag "${reqTag}" not found in kit-config.ts`);
    }
  }

  // ===== Blog freebie checks (only if categorySlugs provided) =====

  if (categorySlugs) {
    const freebieTagPrefix = spec.blogFreebieFlow.tagPrefix;

    // B1: Every category has a blog/{slug} entry in form_tag_mappings
    for (const slug of categorySlugs) {
      const formId = `blog/${slug}`;
      if (!formMappingIds.has(formId)) {
        errors.push(`Category "${slug}" has no form_tag_mapping entry (expected formId: "${formId}")`);
      }
    }

    // B2: Every blog/* form_tag_mapping references valid mailing tags
    for (const mapping of formTagMappings) {
      if (!mapping.formId.startsWith("blog/")) continue;
      for (const tagId of mapping.tagIds) {
        if (!tagIdSet.has(tagId)) {
          errors.push(`Form mapping "${mapping.formId}" references unknown tag "${tagId}"`);
        }
      }
    }

    // B3: Every freebie-* mailing tag has a kit-config entry
    const freebieMailingTags = mailingTags.filter((t) => t.id.startsWith(freebieTagPrefix));
    for (const tag of freebieMailingTags) {
      if (!(tag.id in kitTagConfig)) {
        errors.push(`Mailing tag "${tag.id}" not found in kit-config.ts`);
      }
    }

    // B4: Freebie tag IDs in mailing_tags match kit-config
    for (const tag of freebieMailingTags) {
      const configId = kitTagConfig[tag.id];
      if (configId !== undefined && tag.kitTagId !== undefined && configId !== tag.kitTagId) {
        errors.push(
          `Tag "${tag.id}" ID mismatch: mailing_tags says ${tag.kitTagId}, kit-config says ${configId}`
        );
      }
    }

    // B5: Required blog freebie tags exist
    for (const reqTag of spec.blogFreebieFlow.requiredTags) {
      if (!tagIdSet.has(reqTag)) {
        errors.push(`Required freebie tag "${reqTag}" not found in mailing_tags.json`);
      }
      if (!(reqTag in kitTagConfig)) {
        errors.push(`Required freebie tag "${reqTag}" not found in kit-config.ts`);
      }
    }
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Full validation (for admin API — includes Kit API + code checks)
// ---------------------------------------------------------------------------

export function validateKitIntegration(
  spec: KitIntegrationSpec,
  mailingTags: MailingTag[],
  formTagMappings: FormTagMapping[],
  quizTaxonomy: QuizTaxonomy,
  kitTagConfig: Record<string, number>,
  liveKit: LiveKitState | null,
  codeChecks: CodeChecks | null,
  categorySlugs?: string[],
): IntegrationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: IntegrationCheck[] = [];

  // --- A: Offline cross-references ---
  const offline = validateKitIntegrationOffline(
    spec, mailingTags, formTagMappings, quizTaxonomy, kitTagConfig, categorySlugs,
  );
  errors.push(...offline.errors);
  warnings.push(...offline.warnings);

  const quizTagPrefix = spec.quizSubscribeFlow.tagPrefix;
  const quizMailingTags = mailingTags.filter((t) => t.id.startsWith(quizTagPrefix));

  // Quiz tag config check
  const quizConfigMissing = quizMailingTags.filter((t) => !(t.id in kitTagConfig));
  checks.push({
    label: `Quiz tags: ${quizMailingTags.length - quizConfigMissing.length}/${quizMailingTags.length} mapped in kit-config`,
    status: quizConfigMissing.length === 0 ? "pass" : "fail",
    detail: quizConfigMissing.length > 0
      ? `Missing: ${quizConfigMissing.map((t) => t.id).join(", ")}`
      : undefined,
  });

  // Quiz form tag mappings check
  const quizSlugs = quizTaxonomy.entries.map((q) => q.slug);
  const mappingIds = new Set(formTagMappings.map((m) => m.formId));
  const missingQuizMappings = quizSlugs.filter((s) => !mappingIds.has(`quiz/${s}`));
  checks.push({
    label: `Quiz form mappings: ${quizSlugs.length - missingQuizMappings.length}/${quizSlugs.length} quizzes mapped`,
    status: missingQuizMappings.length === 0 ? "pass" : "fail",
    detail: missingQuizMappings.length > 0
      ? `Missing: ${missingQuizMappings.join(", ")}`
      : undefined,
  });

  // Blog freebie checks (if categorySlugs provided)
  if (categorySlugs) {
    const freebieTagPrefix = spec.blogFreebieFlow.tagPrefix;
    const freebieMailingTags = mailingTags.filter((t) => t.id.startsWith(freebieTagPrefix));

    const freebieConfigMissing = freebieMailingTags.filter((t) => !(t.id in kitTagConfig));
    checks.push({
      label: `Freebie tags: ${freebieMailingTags.length - freebieConfigMissing.length}/${freebieMailingTags.length} mapped in kit-config`,
      status: freebieConfigMissing.length === 0 ? "pass" : "fail",
      detail: freebieConfigMissing.length > 0
        ? `Missing: ${freebieConfigMissing.map((t) => t.id).join(", ")}`
        : undefined,
    });

    const missingFreeMappings = categorySlugs.filter((s) => !mappingIds.has(`blog/${s}`));
    checks.push({
      label: `Blog form mappings: ${categorySlugs.length - missingFreeMappings.length}/${categorySlugs.length} categories mapped`,
      status: missingFreeMappings.length === 0 ? "pass" : "fail",
      detail: missingFreeMappings.length > 0
        ? `Missing: ${missingFreeMappings.join(", ")}`
        : undefined,
    });
  }

  // --- B: Live Kit state ---
  if (liveKit) {
    // Custom fields
    for (const field of spec.customFields) {
      const exists = liveKit.customFields.includes(field);
      checks.push({
        label: `Custom field: ${field}`,
        status: exists ? "pass" : "fail",
        detail: exists ? undefined : "Not found in Kit",
      });
      if (!exists) {
        errors.push(`Kit custom field "${field}" does not exist`);
      }
    }

    const liveTagById = new Map(liveKit.tags.map((t) => [t.id, t]));

    // Quiz tags in live Kit
    let quizLiveFound = 0;
    let quizLiveWithSubs = 0;
    let quizTotalSubs = 0;

    for (const tag of quizMailingTags) {
      const liveTag = tag.kitTagId != null ? liveTagById.get(tag.kitTagId) : undefined;
      if (liveTag) {
        quizLiveFound++;
        if (liveTag.subscriberCount > 0) {
          quizLiveWithSubs++;
          quizTotalSubs += liveTag.subscriberCount;
        }
      } else {
        errors.push(`Quiz tag "${tag.id}" (Kit ID: ${tag.kitTagId ?? "unknown"}) not found in live Kit`);
      }
    }

    checks.push({
      label: `Quiz tags: ${quizLiveFound}/${quizMailingTags.length} exist in Kit`,
      status: quizLiveFound === quizMailingTags.length ? "pass" : "fail",
      detail: quizLiveFound < quizMailingTags.length
        ? `${quizMailingTags.length - quizLiveFound} missing`
        : undefined,
    });

    checks.push({
      label: `Quiz subscribers: ${quizLiveWithSubs}/${quizMailingTags.length} tags have subscribers (${quizTotalSubs} total)`,
      status: "pass",
      detail: quizLiveWithSubs === 0 ? "Pre-launch — 0 subscribers expected" : undefined,
    });

    // Freebie tags in live Kit
    if (categorySlugs) {
      const freebieTagPrefix = spec.blogFreebieFlow.tagPrefix;
      const freebieMailingTags = mailingTags.filter((t) => t.id.startsWith(freebieTagPrefix));
      let freebieLiveFound = 0;
      let freebieLiveWithSubs = 0;
      let freebieTotalSubs = 0;

      for (const tag of freebieMailingTags) {
        const liveTag = tag.kitTagId != null ? liveTagById.get(tag.kitTagId) : undefined;
        if (liveTag) {
          freebieLiveFound++;
          if (liveTag.subscriberCount > 0) {
            freebieLiveWithSubs++;
            freebieTotalSubs += liveTag.subscriberCount;
          }
        } else {
          errors.push(`Freebie tag "${tag.id}" (Kit ID: ${tag.kitTagId ?? "unknown"}) not found in live Kit`);
        }
      }

      checks.push({
        label: `Freebie tags: ${freebieLiveFound}/${freebieMailingTags.length} exist in Kit`,
        status: freebieLiveFound === freebieMailingTags.length ? "pass" : "fail",
        detail: freebieLiveFound < freebieMailingTags.length
          ? `${freebieMailingTags.length - freebieLiveFound} missing`
          : undefined,
      });

      checks.push({
        label: `Freebie subscribers: ${freebieLiveWithSubs}/${freebieMailingTags.length} tags have subscribers (${freebieTotalSubs} total)`,
        status: "pass",
        detail: freebieLiveWithSubs === 0 ? "Pre-launch — 0 subscribers expected" : undefined,
      });
    }
  } else {
    checks.push({
      label: "Kit API",
      status: "warn",
      detail: "Could not fetch live Kit state (no API key?)",
    });
    warnings.push("Could not validate against live Kit state");
  }

  // --- C: Code checks ---
  if (codeChecks) {
    // API routes
    for (const [routeName, routePath] of Object.entries(spec.subscriberApiRoutes)) {
      const exists = codeChecks.apiRouteResults[routeName] ?? false;
      checks.push({
        label: `API route: ${routePath}`,
        status: exists ? "pass" : "fail",
        detail: exists ? undefined : "File not found",
      });
      if (!exists) {
        errors.push(`API route file for "${routePath}" not found`);
      }
    }

    // Frontend checks
    for (const [key, checkSpec] of Object.entries(spec.frontendChecks)) {
      const result = codeChecks.frontendResults[key];
      if (!result) {
        checks.push({
          label: `Frontend: ${key}`,
          status: "fail",
          detail: "Check not performed",
        });
        errors.push(`Frontend check "${key}" was not performed`);
        continue;
      }

      if (!result.exists) {
        checks.push({
          label: `Frontend: ${key}`,
          status: "fail",
          detail: `File not found: ${checkSpec.file}`,
        });
        errors.push(`Frontend file "${checkSpec.file}" not found`);
        continue;
      }

      if (!result.hasPatterns) {
        checks.push({
          label: `Frontend: ${key}`,
          status: "fail",
          detail: `Missing: ${result.missingPatterns.join(", ")}`,
        });
        errors.push(
          `Frontend "${key}" missing patterns: ${result.missingPatterns.join(", ")}`
        );
      } else {
        checks.push({
          label: `Frontend: ${key}`,
          status: "pass",
        });
      }
    }
  } else {
    checks.push({
      label: "Code checks",
      status: "warn",
      detail: "Not performed (requires file system access)",
    });
    warnings.push("Code checks were not performed");
  }

  return { errors, warnings, checks };
}
