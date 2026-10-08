"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  integrationRequestSchema,
  SERVICE_OPTIONS,
  toFieldErrors,
  type FieldErrors,
  type IntegrationRequestField,
} from "@/lib/validation/integrationRequest";

type FormStatus = "idle" | "submitting" | "success" | "error";

const VISIBLE_FIELDS = ["name", "email", "service", "description"] as const;
const SAVE_ERROR = "We couldn't save your request. Please try again.";

const fieldClassName =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-foreground";

export function IntegrationRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [faxNumber, setFaxNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [requestId, setRequestId] = useState("");
  const submittingRef = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  function clearFieldError(field: IntegrationRequestField) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusFirstInvalid(errors: FieldErrors) {
    const firstInvalid = VISIBLE_FIELDS.find((field) => errors[field]);
    if (!firstInvalid) {
      return;
    }

    document.getElementById(fieldId(firstInvalid))?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    const parsed = integrationRequestSchema.safeParse({
      name,
      email,
      service,
      description,
      faxNumber,
    });

    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error);
      setFieldErrors(errors);
      setStatus("idle");
      setRequestId("");
      focusFirstInvalid(errors);
      return;
    }

    submittingRef.current = true;
    setFieldErrors({});
    setStatus("submitting");
    setRequestId("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          service: parsed.data.service,
          description: parsed.data.description,
          faxNumber: parsed.data.faxNumber,
        }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.status === 201 && isPersistedRequest(payload)) {
        setRequestId(payload.requestId);
        setStatus("success");
        return;
      }

      if (response.status === 400) {
        const errors = readServerFieldErrors(payload);
        const hasVisibleError = VISIBLE_FIELDS.some((field) => errors[field]);
        if (hasVisibleError) {
          setFieldErrors(errors);
          setStatus("idle");
          focusFirstInvalid(errors);
          return;
        }
      }

      setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  function startAnotherRequest() {
    setName("");
    setEmail("");
    setService("");
    setDescription("");
    setFaxNumber("");
    setFieldErrors({});
    setRequestId("");
    setStatus("idle");
    window.setTimeout(() => {
      document.getElementById(fieldId("name"))?.focus();
    }, 0);
  }

  const trimmedDescriptionLength = description.trim().length;

  return (
    <section id="request" className="scroll-mt-28" aria-labelledby="request-heading">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 id="request-heading" className="text-3xl font-semibold tracking-tight">
            Request an integration
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            Describe the workflow you want connected. All fields are required.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            DataBridge is a fictional demonstration. Saving a request does not start a live integration.
          </p>

          <div ref={statusRef} tabIndex={-1} className="mt-6 outline-none">
            <p className="sr-only" aria-live="polite">
              {status === "submitting" ? "Sending request." : ""}
            </p>
            {status === "success" ? (
              <div role="status" aria-live="polite" className="rounded-xl border border-success bg-success-soft p-5 text-success">
                <p className="text-lg font-semibold">Request received.</p>
                <p className="mt-2 leading-7">
                  Your integration request has been saved successfully.
                </p>
                <p className="mt-3 text-sm break-all">Reference: {requestId}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-success bg-white px-4 text-sm font-semibold text-success"
                  onClick={startAnotherRequest}
                >
                  Submit another request
                </button>
              </div>
            ) : null}
            {status === "error" ? (
              <p role="alert" className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm leading-6 text-danger">
                {SAVE_ERROR}
              </p>
            ) : null}
          </div>

          {status === "success" ? null : (
            <form className="relative mt-6 grid gap-5" noValidate onSubmit={handleSubmit} aria-busy={status === "submitting"}>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="faxNumber">Fax number</label>
                <input
                  id="faxNumber"
                  name="faxNumber"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={faxNumber}
                  onChange={(event) => setFaxNumber(event.target.value)}
                />
              </div>

              <Field
                id={fieldId("name")}
                label="Full name"
                error={fieldErrors.name}
              >
                <input
                  id={fieldId("name")}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  required
                  disabled={status === "submitting"}
                  value={name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? errorId("name") : undefined}
                  className={inputClassName(Boolean(fieldErrors.name))}
                  placeholder="Alex Morgan"
                  onChange={(event) => {
                    setName(event.target.value);
                    clearFieldError("name");
                  }}
                />
              </Field>

              <Field
                id={fieldId("email")}
                label="Email"
                error={fieldErrors.email}
              >
                <input
                  id={fieldId("email")}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  required
                  disabled={status === "submitting"}
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? errorId("email") : undefined}
                  className={inputClassName(Boolean(fieldErrors.email))}
                  placeholder="alex@example.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                />
              </Field>

              <Field
                id={fieldId("service")}
                label="Service"
                error={fieldErrors.service}
              >
                <select
                  id={fieldId("service")}
                  name="service"
                  required
                  disabled={status === "submitting"}
                  value={service}
                  aria-invalid={Boolean(fieldErrors.service)}
                  aria-describedby={fieldErrors.service ? errorId("service") : undefined}
                  className={inputClassName(Boolean(fieldErrors.service))}
                  onChange={(event) => {
                    setService(event.target.value);
                    clearFieldError("service");
                  }}
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id={fieldId("description")}
                label="Project description"
                error={fieldErrors.description}
                hintId="integration-description-hint"
                hint="At least 20 characters. Describe the workflow and the systems involved."
              >
                <textarea
                  id={fieldId("description")}
                  name="description"
                  rows={6}
                  maxLength={1000}
                  required
                  disabled={status === "submitting"}
                  value={description}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={
                    fieldErrors.description
                      ? "integration-description-hint integration-description-error"
                      : "integration-description-hint"
                  }
                  className={inputClassName(Boolean(fieldErrors.description))}
                  placeholder="Each weekday, copy new rows from the orders spreadsheet into the CRM."
                  onChange={(event) => {
                    setDescription(event.target.value);
                    clearFieldError("description");
                  }}
                />
                <p className="text-right text-xs text-muted">
                  {trimmedDescriptionLength} / 1000
                </p>
              </Field>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending request..." : "Request an integration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  hintId,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  hintId?: string;
  children: ReactNode;
}) {
  const fieldName = id.replace("integration-", "");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm leading-6 text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId(fieldName)} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function fieldId(field: string) {
  return `integration-${field}`;
}

function errorId(field: string) {
  return `integration-${field}-error`;
}

function inputClassName(invalid: boolean) {
  return invalid ? `${fieldClassName} border-danger` : fieldClassName;
}

function isPersistedRequest(
  value: unknown,
): value is { success: true; requestId: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("success" in value) || value.success !== true) {
    return false;
  }

  return "requestId" in value && typeof value.requestId === "string" && value.requestId.length > 0;
}

function readServerFieldErrors(value: unknown): FieldErrors {
  if (typeof value !== "object" || value === null || !("fields" in value)) {
    return {};
  }

  const source = value.fields;
  if (typeof source !== "object" || source === null) {
    return {};
  }

  const errors: FieldErrors = {};
  for (const field of VISIBLE_FIELDS) {
    const message = readStringField(source, field);
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

function readStringField(source: object, field: string) {
  if (!Object.hasOwn(source, field)) {
    return undefined;
  }

  const value: unknown = Reflect.get(source, field);
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return undefined;
}
