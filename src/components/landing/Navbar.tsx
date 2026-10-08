const primaryActionClassName =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-accent-strong";

export function Navbar() {
  return (
    <header id="top" className="sticky top-0 z-20 border-b border-line bg-surface">
      <a className="skip-link" href="#request">
        Skip to integration request
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#top" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
          <LogoMark />
          DataBridge
        </a>
        <nav
          aria-label="Primary"
          className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted sm:order-2 sm:w-auto sm:flex-1 sm:justify-end sm:pr-2"
        >
          <a className="inline-flex min-h-11 items-center hover:text-foreground" href="#services">
            Services
          </a>
          <a className="inline-flex min-h-11 items-center hover:text-foreground" href="#how-it-works">
            How it works
          </a>
          <a className="inline-flex min-h-11 items-center hover:text-foreground" href="#request">
            Contact
          </a>
        </nav>
        <a className={`${primaryActionClassName} order-2 sm:order-3`} href="#request">
          Request integration
        </a>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 text-accent">
      <rect x="2.5" y="6.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <rect x="21.5" y="17.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M10.5 10.5h5.2c2.7 0 4.3 1.5 4.3 3.6S18.4 17.7 15.7 17.7H10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
