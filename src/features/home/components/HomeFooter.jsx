const COLUMNS = [
  { heading: "Company", links: ["About Us", "Careers", "Security"] },
  { heading: "Contact", links: ["Partnerships", "Support", "Press"] },
  { heading: "Legal", links: ["Terms", "Privacy", "AML Policy"] },
];

export function HomeFooter() {
  return (
    <footer className="bg-brand-900 py-12 text-white/70">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column (spans 2) */}
          <div className="md:col-span-2">
            <p className="text-lg font-semibold text-white">Equine Elite</p>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              Democratizing the thoroughbred industry through subscription
              management since 2026.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-sm font-semibold text-white">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-sm text-white/50">© 2026 Equine Elite</p>
        </div>
      </div>
    </footer>
  );
}
