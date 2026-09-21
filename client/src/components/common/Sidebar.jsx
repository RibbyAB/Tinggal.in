import { NavLink } from "react-router-dom";

export default function Sidebar({ title, links, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-primary-800 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:self-start ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-primary-700">
            T
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Tinggal<span className="text-primary-300">.in</span>
            </p>
            <p className="text-xs text-primary-200">{title}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-primary-100/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
} 