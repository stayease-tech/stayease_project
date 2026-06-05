// Copyright Aravind Adari

/**
 * Pagination — reusable gold-styled page navigator.
 *
 * @param {object} props
 * @param {number} props.currentPage - Active page (1-based).
 * @param {number} props.totalPages - Total number of pages.
 * @param {Function} props.onPageChange - Callback(pageNumber) when a page is selected.
 * @returns {React.ReactElement|null}
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const btnBase = "flex items-center justify-center h-8 w-8 rounded transition-colors duration-200 text-sm";
    const activeCls = "bg-[#D4A017] text-white";
    const inactiveCls = "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white";
    const disabledCls = "opacity-50 cursor-not-allowed";

    const pages = [];

    // Always show page 1
    pages.push(1);

    // Show ellipsis before current window
    if (currentPage > 3) pages.push("...");

    // Pages around current
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
        if (!pages.includes(p)) pages.push(p);
    }

    // Show ellipsis after current window
    if (currentPage < totalPages - 2) pages.push("...");

    // Always show last page
    if (totalPages > 1) pages.push(totalPages);

    return (
        <div className="flex flex-wrap justify-center items-center mt-4 gap-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${btnBase} ${currentPage === 1 ? `${inactiveCls} ${disabledCls}` : inactiveCls}`}
                aria-label="Previous page"
            >
                &lt;
            </button>

            {pages.map((page, idx) =>
                page === "..." ? (
                    <span key={`ellipsis-${idx}`} className={`${btnBase} cursor-default`}>…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`${btnBase} ${currentPage === page ? activeCls : inactiveCls}`}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${btnBase} ${currentPage === totalPages ? `${inactiveCls} ${disabledCls}` : inactiveCls}`}
                aria-label="Next page"
            >
                &gt;
            </button>
        </div>
    );
}
