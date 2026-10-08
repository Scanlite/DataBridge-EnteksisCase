const problems = [
  "Repetitive work",
  "Inconsistent records",
  "Delayed reporting",
  "Avoidable errors",
];

export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-28 border-y border-line bg-surface" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <h2 id="problem-heading" className="text-3xl font-semibold tracking-tight">
            Your data should not require copy and paste.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            Businesses often keep customer, sales and operational information in several disconnected tools. Manual transfer creates:
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {problems.map((problem) => (
              <li key={problem} className="rounded-lg border border-line bg-background px-4 py-3 text-sm font-medium">
                {problem}
              </li>
            ))}
          </ul>
          <p className="mt-6 leading-7 text-muted">
            DataBridge helps connect those systems into structured data flows.
          </p>
        </div>
      </div>
    </section>
  );
}
