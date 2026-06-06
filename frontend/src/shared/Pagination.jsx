// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — compact gold-styled page navigator.
 * Shows prev/next chevrons, page numbers with ellipsis, and a "Page X of Y" counter.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages < 1) totalPages = 1;

    const btn = "flex items-center justify-center h-7 w-7 rounded text-xs transition-colors duration-150";
    const active = "bg-[#D4A017] text-white font-semibold";
    const inactive = "bg-gray-100 text-gray-600 hover:bg-[#D4A017] hover:text-white";
    const disabled = "opacity-40 cursor-not-allowed pointer-events-none";

    // Build page number list with ellipsis
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
        if (!pages.includes(p)) pages.push(p);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    if (totalPages > 1) pages.push(totalPages);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-1 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${btn} ${currentPage === 1 ? `${inactive} ${disabled}` : inactive}`}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={13} />
                </button>

                {pages.map((p, idx) =>
                    p === "…" ? (
                        <span key={`e${idx}`} className="flex items-center justify-center h-7 w-5 text-xs text-gray-400">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`${btn} ${currentPage === p ? active : inactive}`}
                            aria-current={currentPage === p ? "page" : undefined}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${btn} ${currentPage === totalPages ? `${inactive} ${disabled}` : inactive}`}
                    aria-label="Next page"
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}
