export function SiteFooter() {
  return (
    <footer className="mt-10 px-2 pb-4 pt-8 text-sm text-muted">
      <div className="rounded-[24px] border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/linkify-logo.png"
              alt="Linkify"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p>Secure sharing with expiry, password protection, and quick downloads.</p>
        </div>
      </div>
    </footer>
  );
}
