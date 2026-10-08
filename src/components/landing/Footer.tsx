export function Footer() {
  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-lg font-semibold">DataBridge</p>
          <p className="mt-2 text-sm leading-6 text-footer-muted">
            DataBridge is a fictional service created for a technical demonstration. It does not provide live integrations, and it has no customers or uptime guarantees.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a className="inline-flex min-h-11 items-center text-footer-muted hover:text-white" href="#services">
            Services
          </a>
          <a className="inline-flex min-h-11 items-center text-footer-muted hover:text-white" href="#how-it-works">
            How it works
          </a>
          <a className="inline-flex min-h-11 items-center text-footer-muted hover:text-white" href="#request">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
