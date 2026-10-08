import { getPrisma } from "@/lib/db";
import {
  integrationRequestSchema,
  toFieldErrors,
  type FieldErrors,
  type IntegrationRequestData,
} from "@/lib/validation/integrationRequest";

export type CreateIntegrationRequestResult =
  | {
      status: 201;
      body: {
        success: true;
        requestId: string;
      };
    }
  | {
      status: 400;
      body: {
        success: false;
        error: "INVALID_REQUEST";
        message: string;
        fields?: FieldErrors;
      };
    }
  | {
      status: 500;
      body: {
        success: false;
        error: "PERSISTENCE_FAILED";
        message: string;
      };
    };

const INVALID_MESSAGE = "Check the form and try again.";
const PERSISTENCE_MESSAGE = "We couldn't save your request. Please try again.";

export async function createIntegrationRequest(
  payload: unknown,
): Promise<CreateIntegrationRequestResult> {
  const parsed = integrationRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        success: false,
        error: "INVALID_REQUEST",
        message: INVALID_MESSAGE,
        fields: toFieldErrors(parsed.error),
      },
    };
  }

  const data: IntegrationRequestData = {
    name: parsed.data.name,
    email: parsed.data.email,
    service: parsed.data.service,
    description: parsed.data.description,
  };

  try {
    const record = await getPrisma().integrationRequest.create({
      data,
      select: { id: true },
    });

    return {
      status: 201,
      body: {
        success: true,
        requestId: record.id,
      },
    };
  } catch {
    console.error("Integration request persistence failed.");

    return {
      status: 500,
      body: {
        success: false,
        error: "PERSISTENCE_FAILED",
        message: PERSISTENCE_MESSAGE,
      },
    };
  }
}
