// Copyright (c) 2026 Aravind Adari. All rights reserved.

/**
 * DataTable — compact table with sticky header, internal scroll, and responsive column hiding.
 *
 * Props:
 *   columns  Array<{ key, label, render?(row,idx), className?, headerClassName?, priority? }>
 *            priority 1=always, 2=hidden<lg, 3=hidden<xl  (default 1)
 *   data     Array<object>
 *   loading  bool
 *   emptyMessage  string
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = "No data available",
}) {
    const colSpan = columns.length;

    function priCls(p) {
        if (p === 2) return "hidden lg:table-cell";
        if (p === 3) return "hidden xl:table-cell";
        return "";
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${priCls(col.priority)} ${col.headerClassName || ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={colSpan} className="px-3 py-8 text-center text-gray-400">
                                <div className="flex justify-center"><div className="spinner" /></div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="px-3 py-10 text-center text-gray-400 text-sm">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIdx) => (
                            <tr key={row.id ?? rowIdx} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-3 py-1.5 text-gray-800 ${priCls(col.priority)} ${col.className || ""}`}
                                    >
                                        {col.render ? col.render(row, rowIdx) : (row[col.key] ?? "—")}
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
