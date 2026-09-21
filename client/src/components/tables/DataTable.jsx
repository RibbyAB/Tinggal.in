import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";

// Generic, reusable table: columns = [{ key, header, render? }].
// render(row) lets a page customize a cell (badges, currency, buttons)
// without needing a bespoke table component per page.
export default function DataTable({ columns, rows, loading, emptyText = "No records found." }) {
  if (loading) return <LoadingSpinner />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyText} />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
