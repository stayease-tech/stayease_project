// Copyright Aravind Adari
import { LoadingState, EmptyState } from "./StateDisplays";

/**
 * DataTable — reusable styled table component with responsive column hiding.
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, render?: Function, priority?: number, className?: string}>} props.columns
 *   - `priority` 1 = always visible, 2 = hidden below lg (1024px), 3 = hidden below xl (1280px).
 *   - `render(row, index)` optional custom cell renderer.
 * @param {Array<object>} props.data - Array of row objects.
 * @param {boolean} [props.loading=false] - Shows loading spinner when true.
 * @param {string} [props.emptyMessage="No data available"] - Message for empty state.
 * @param {string} [props.className] - Extra class on the wrapper div.
 * @returns {React.ReactElement}
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = "No data available",
    className = "",
}) {
    const colSpan = columns.length;

    /**
     * Returns responsive Tailwind classes based on priority.
     * Priority 2 hides below lg, priority 3 hides below xl.
     */
    function priorityCls(priority) {
        if (priority === 2) return "hidden lg:table-cell";
        if (priority === 3) return "hidden xl:table-cell";
        return "";
    }

    return (
        <div className={`w-full overflow-x-auto ${className}`}>
            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-700">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`border border-gray-300 py-2 px-4 text-center font-medium ${priorityCls(col.priority)} ${col.className || ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={colSpan} className="border border-gray-300 px-4 py-8">
                                <LoadingState />
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="border border-gray-300 px-4 py-2">
                                <EmptyState message={emptyMessage} />
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIdx) => (
                            <tr key={row.id ?? rowIdx} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`border border-gray-300 px-4 py-2 text-center ${priorityCls(col.priority)} ${col.className || ""}`}
                                    >
                                        {col.render
                                            ? col.render(row, rowIdx)
                                            : row[col.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
