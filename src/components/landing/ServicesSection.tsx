import { SERVICE_OPTIONS } from "@/lib/validation/integrationRequest";

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-28" aria-labelledby="services-heading">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="services-heading" className="text-3xl font-semibold tracking-tight">
            Services
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            Four ways DataBridge can connect the tools a business already uses.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((service) => (
            <li key={service.value} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="text-lg font-semibold">{service.label}</h3>
              <p className="mt-2 leading-7 text-muted">{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
