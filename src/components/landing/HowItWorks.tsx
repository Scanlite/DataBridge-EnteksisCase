const steps = [
  {
    title: "Describe your workflow",
    description: "Tell us which manual transfer, export, or sync is taking time.",
  },
  {
    title: "Identify the systems",
    description: "List the spreadsheets, APIs, CRM tools, or reports involved.",
  },
  {
    title: "Design the data connection",
    description: "We map a structured flow that moves the data between those systems.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 border-y border-line bg-surface"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="how-heading" className="text-3xl font-semibold tracking-tight">
          How it works
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          A short request is enough to start. This page does not run a setup wizard.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-background p-6">
              <p aria-hidden="true" className="font-mono text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-7 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
