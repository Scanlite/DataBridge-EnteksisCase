import { describe, expect, it } from "vitest";
import { integrationRequestSchema } from "@/lib/validation/integrationRequest";

const validRequest = {
  name: "Alex Morgan",
  email: "Alex@Example.com",
  service: "api_integration",
  description:
    "Sync new Acme Labs orders from the spreadsheet into the CRM each weekday.",
};

describe("integration request validation", () => {
  it("accepts a valid request and normalizes the email", () => {
    const parsed = integrationRequestSchema.safeParse(validRequest);

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data).toMatchObject({
      name: "Alex Morgan",
      email: "alex@example.com",
      service: "api_integration",
      description: validRequest.description,
      faxNumber: "",
    });
    expect(parsed.data).not.toHaveProperty("status");
    expect(parsed.data).not.toHaveProperty("createdAt");
  });

  it("rejects an invalid email", () => {
    const parsed = integrationRequestSchema.safeParse({
      ...validRequest,
      email: "not-an-email",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an empty or too-short name", () => {
    expect(
      integrationRequestSchema.safeParse({ ...validRequest, name: "" }).success,
    ).toBe(false);
    expect(
      integrationRequestSchema.safeParse({ ...validRequest, name: "A" }).success,
    ).toBe(false);
  });

  it("rejects an unsupported service value", () => {
    const unsupported = integrationRequestSchema.safeParse({
      ...validRequest,
      service: "spreadsheet_magic",
    });
    const label = integrationRequestSchema.safeParse({
      ...validRequest,
      service: "Excel Automation",
    });

    expect(unsupported.success).toBe(false);
    expect(label.success).toBe(false);
    if (unsupported.success || label.success) {
      return;
    }

    expect(unsupported.error.flatten().fieldErrors.service?.[0]).toBe(
      "Select a service.",
    );
    expect(label.error.flatten().fieldErrors.service?.[0]).toBe(
      "Select a service.",
    );
  });

  it("rejects a too-short description", () => {
    const parsed = integrationRequestSchema.safeParse({
      ...validRequest,
      description: "Too short",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects a too-long description", () => {
    const parsed = integrationRequestSchema.safeParse({
      ...validRequest,
      description: "a".repeat(1001),
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects whitespace-only values", () => {
    const parsed = integrationRequestSchema.safeParse({
      name: "   ",
      email: "   ",
      service: "crm_sync",
      description: "                    ",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const fields = parsed.error.flatten().fieldErrors;
    expect(fields.name?.[0]).toBeTruthy();
    expect(fields.email?.[0]).toBeTruthy();
    expect(fields.description?.[0]).toBeTruthy();
  });

  it("trims surrounding whitespace before applying length rules", () => {
    const parsed = integrationRequestSchema.safeParse({
      ...validRequest,
      name: "  Alex Morgan  ",
      description: `  ${"b".repeat(20)}  `,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data.name).toBe("Alex Morgan");
    expect(parsed.data.description).toBe("b".repeat(20));
  });

  it("ignores client-supplied status and createdAt", () => {
    const parsed = integrationRequestSchema.safeParse({
      ...validRequest,
      status: "approved",
      createdAt: "2000-01-01T00:00:00.000Z",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data).not.toHaveProperty("status");
    expect(parsed.data).not.toHaveProperty("createdAt");
  });
});
