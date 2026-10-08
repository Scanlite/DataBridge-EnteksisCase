export function Hero() {
  return (
    <section className="flow-grid" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
        <div>
          <p className="max-w-xl font-mono text-xs font-medium tracking-[0.12em] text-accent text-balance uppercase sm:tracking-[0.16em]">
            Data integration, without the manual work
          </p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            Connect your data. Simplify your operations.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            DataBridge helps businesses connect spreadsheets, APIs, CRM systems and reporting tools through reliable data integration workflows.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#request"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold whitespace-nowrap text-white hover:bg-accent-strong"
            >
              Request an integration
            </a>
            <p className="text-sm leading-6 text-muted">
              No unnecessary platform migration. Connect the tools you already use.
            </p>
          </div>
        </div>
        <FlowDiagram />
      </div>
    </section>
  );
}

function FlowDiagram() {
  const sources = ["Spreadsheet", "CRM", "API"];

  return (
    <div aria-hidden="true" className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">Example flow</p>
      <div className="mt-5 grid gap-3">
        {sources.map((source) => (
          <div key={source} className="flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm font-medium">
              {source}
            </div>
            <div className="h-px w-8 bg-line" />
            <div className="h-2 w-2 rounded-full bg-accent" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white">
        DataBridge workflow
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <div className="h-px w-8 bg-line" />
        <div className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm font-medium">
          Reporting
        </div>
      </div>
    </div>
  );
}
