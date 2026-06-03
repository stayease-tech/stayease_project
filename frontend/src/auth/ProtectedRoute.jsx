import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * ProtectedRoute — wraps a route and redirects unauthenticated users.
 * Admin users bypass the type restriction and can access any portal route.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected page component.
 * @param {string} [props.allowedType] - The user role permitted to access this route.
 * @returns {React.ReactElement}
 */
function ProtectedRoute({ children, allowedType }) {
    const { user, userType, isLoading, DEFAULT_ROUTES } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If route requires a specific user type and user doesn't match, redirect to their dashboard
    // Admin users can access all portal routes
    if (allowedType && userType !== allowedType && userType !== 'admin') {
        const redirectTo = DEFAULT_ROUTES[userType] || "/login";
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}

export default ProtectedRoute;
