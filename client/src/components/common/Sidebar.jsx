import { NavLink } from "react-router-dom";

// Shared sidebar shell used by all three layouts, configured with the
// nav links relevant to that role. Desktop: fixed sidebar. Mobile: drawer
// toggled by the parent layout (spec section 16).
export default function Sidebar({ title, links, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-100 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            K
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Kost Management</p>
            <p className="text-xs text-gray-400">{title}</p>
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
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
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
