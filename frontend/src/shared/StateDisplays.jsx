// Copyright Aravind Adari
import { InboxIcon } from "lucide-react";

/**
 * LoadingState — centered spinner using the .spinner CSS class.
 *
 * @returns {React.ReactElement}
 */
export function LoadingState() {
    return (
        <div className="loading-center">
            <div className="spinner"></div>
        </div>
    );
}

/**
 * EmptyState — icon + message displayed when a table or list has no data.
 *
 * @param {object} props
 * @param {string} [props.message="No data available"] - Message to display.
 * @param {React.ReactNode} [props.icon] - Optional icon component to override default.
 * @returns {React.ReactElement}
 */
export function EmptyState({ message = "No data available", icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            {icon ?? <InboxIcon size={48} className="mb-3 text-gray-300" />}
            <p className="text-sm">{message}</p>
        </div>
    );
}
