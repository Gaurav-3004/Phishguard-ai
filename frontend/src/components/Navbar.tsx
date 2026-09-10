import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck, Menu, X } from "lucide-react";

const LINKS = [
  { to: "/analyze", label: "Analyze" },
  { to: "/simulator", label: "Simulator" },
  { to: "/history", label: "History" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learn", label: "Learn" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-signal" : "text-mist-muted hover:text-mist"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-signal" strokeWidth={2.2} />
          <span className="font-display text-[15px] font-semibold tracking-tight text-mist">
            PhishGuard <span className="text-signal">AI</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <button onClick={() => navigate("/analyze")} className="btn-primary">
            Scan Now
          </button>
        </div>

        <button
          className="md:hidden text-mist"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/analyze");
              }}
              className="btn-primary mt-1 w-full"
            >
              Scan Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
