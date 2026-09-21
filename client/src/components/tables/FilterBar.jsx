export default function FilterBar({ search, onSearchChange, searchPlaceholder = "Search...", filters = [], values = {}, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
      {onSearchChange && (
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      )}
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] || ""}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
