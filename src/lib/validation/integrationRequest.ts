import { z } from "zod";

export const serviceSchema = z.enum(
  [
    "excel_automation",
    "api_integration",
    "crm_sync",
    "dashboard_reporting",
  ],
  {
    errorMap: () => ({ message: "Select a service." }),
  },
);

export type ServiceValue = z.infer<typeof serviceSchema>;

export const SERVICE_VALUES = serviceSchema.options;

const SERVICE_DETAILS: Record<
  ServiceValue,
  { label: string; description: string }
> = {
  excel_automation: {
    label: "Excel Automation",
    description:
      "Reduce repetitive spreadsheet-based data transfer and operational work.",
  },
  api_integration: {
    label: "API Integration",
    description:
      "Connect applications and move structured data securely between systems.",
  },
  crm_sync: {
    label: "CRM Sync",
    description:
      "Keep customer and operational records synchronized across business tools.",
  },
  dashboard_reporting: {
    label: "Dashboard & Reporting",
    description:
      "Bring data from multiple sources together for clearer reporting.",
  },
};

export const SERVICE_OPTIONS = SERVICE_VALUES.map((value) => ({
  value,
  label: SERVICE_DETAILS[value].label,
  description: SERVICE_DETAILS[value].description,
}));

export const integrationRequestFields = [
  "name",
  "email",
  "service",
  "description",
  "faxNumber",
] as const;

export type IntegrationRequestField = (typeof integrationRequestFields)[number];

export type FieldErrors = Partial<Record<IntegrationRequestField, string>>;

export const integrationRequestSchema = z.object({
  name: z
    .string({ required_error: "Enter your full name." })
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string({ required_error: "Enter an email address." })
    .trim()
    .min(1, "Enter an email address.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  service: serviceSchema,
  description: z
    .string({ required_error: "Describe the integration." })
    .trim()
    .min(20, "Describe the workflow in at least 20 characters.")
    .max(1000, "Description must be 1000 characters or fewer."),
  // Honeypot. Real users never see this field. A value means the submission is rejected.
  faxNumber: z
    .string()
    .trim()
    .max(0, "Invalid submission.")
    .optional()
    .default(""),
});

export const IntegrationRequestSchema = integrationRequestSchema;

export type IntegrationRequestInput = z.input<typeof integrationRequestSchema>;

export type IntegrationRequestData = Omit<
  z.output<typeof integrationRequestSchema>,
  "faxNumber"
>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const flattened = error.flatten().fieldErrors;
  const fields: FieldErrors = {};

  for (const field of integrationRequestFields) {
    const message = flattened[field]?.[0];
    if (message) {
      fields[field] = message;
    }
  }

  return fields;
}
