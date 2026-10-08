import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    integrationRequest: {
      create,
    },
  }),
}));

import { POST } from "@/app/api/requests/route";

const validRequest = {
  name: "Alex Morgan",
  email: "Alex@Example.com",
  service: "crm_sync",
  description: "Keep Acme Labs CRM contacts aligned with the billing spreadsheet.",
};

function postJson(body: unknown) {
  return POST(
    new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/requests", () => {
  beforeEach(() => {
    create.mockReset();
  });

  it("returns success only after the record is persisted", async () => {
    create.mockResolvedValue({ id: "req_test_123" });

    const response = await postJson({
      ...validRequest,
      status: "approved",
      createdAt: "2000-01-01T00:00:00.000Z",
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      success: true,
      requestId: "req_test_123",
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Alex Morgan",
        email: "alex@example.com",
        service: "crm_sync",
        description: validRequest.description,
      },
      select: { id: true },
    });
  });

  it("rejects an invalid request before persistence", async () => {
    const response = await postJson({
      ...validRequest,
      email: "not-an-email",
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("INVALID_REQUEST");
    expect(body.fields.email).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects an unsupported service before persistence", async () => {
    const response = await postJson({
      ...validRequest,
      service: "not_a_service",
    });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns an error and not success when persistence fails", async () => {
    create.mockRejectedValue(new Error("database unavailable"));

    const response = await postJson(validRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: "PERSISTENCE_FAILED",
      message: "We couldn't save your request. Please try again.",
    });
    expect(body.requestId).toBeUndefined();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("INVALID_REQUEST");
    expect(create).not.toHaveBeenCalled();
  });

  it("does not persist a filled honeypot submission", async () => {
    const response = await postJson({
      ...validRequest,
      faxNumber: "https://spam.example",
    });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
