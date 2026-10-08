import { createIntegrationRequest } from "@/lib/integrationRequests";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: "INVALID_REQUEST",
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const result = await createIntegrationRequest(payload);

  return Response.json(result.body, { status: result.status });
}
