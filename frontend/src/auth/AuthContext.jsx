import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

// Maps permission prefixes to user types
const PERMISSION_TYPE_MAP = {
    'stayease_accounts.': 'accounts',
    'stayease_operations.': 'operations',
    'stayease_sales.': 'sales',
    'stayease_supply.': 'supply',
};

// Maps user types to their API endpoint prefixes
const API_PREFIX_MAP = {
    admin: '/accounts',
    accounts: '/accounts',
    operations: '/operations',
    sales: '/sales',
    supply: '/supply',
    partners: '/partners',
    resident: '/resident-portal',
};

// Maps user types to their default landing pages after login
const DEFAULT_ROUTES = {
    admin: '/admin/dashboard',
    accounts: '/accounts/dashboard',
    operations: '/operations/dashboard',
    sales: '/sales/dashboard',
    supply: '/supply/dashboard',
    partners: '/partners/partners-home',
    resident: '/resident/dashboard',
};

function detectUserType(permissions) {
    // Count permissions per type to find the best match
    const counts = {};
    for (const perm of permissions) {
        for (const [prefix, type] of Object.entries(PERMISSION_TYPE_MAP)) {
            if (perm.startsWith(prefix)) {
                counts[type] = (counts[type] || 0) + 1;
            }
        }
    }
    // Return the type with the most matching permissions
    let best = null;
    let bestCount = 0;
    for (const [type, count] of Object.entries(counts)) {
        if (count > bestCount) {
            best = type;
            bestCount = count;
        }
    }
    return best;
}

function setupAxiosDefaults() {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common["X-CSRFToken"] = Cookies.get("csrftoken");
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });
    const [userType, setUserType] = useState(() => {
        return localStorage.getItem("userType") || null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            setupAxiosDefaults();
            const storedType = localStorage.getItem("userType");

            if (!storedType) {
                setIsLoading(false);
                return;
            }

            // Partners use a different auth flow
            if (storedType === 'partners') {
                const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                if (isLoggedIn) {
                    setUser(localStorage.getItem("phone"));
                    setUserType('partners');
                } else {
                    clearAuth();
                }
                setIsLoading(false);
                return;
            }

            // Residents use JWT auth
            if (storedType === 'resident') {
                const token = localStorage.getItem("residentAccessToken");
                if (token) {
                    setUser(localStorage.getItem("phone"));
                    setUserType('resident');
                } else {
                    clearAuth();
                }
                setIsLoading(false);
                return;
            }

            const prefix = API_PREFIX_MAP[storedType];
            if (!prefix) {
                clearAuth();
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.post(`${prefix}/auth-check/`, {}, { withCredentials: true });
                if (response.data.isAuthenticated) {
                    setUser(response.data.username);
                    setUserType(storedType);
                    localStorage.setItem("user", JSON.stringify(response.data.username));
                } else {
                    clearAuth();
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                clearAuth();
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    function clearAuth() {
        setUser(null);
        setUserType(null);
        localStorage.removeItem("user");
        localStorage.removeItem("useremail");
        localStorage.removeItem("login_id");
        localStorage.removeItem("userType");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("phone");
        localStorage.removeItem("residentAccessToken");
        localStorage.removeItem("residentRefreshToken");
        localStorage.removeItem("residentData");
    }

    const login = async (username, password) => {
        setupAxiosDefaults();

        try {
            const response = await axios.post("/accounts/login-data/", { username, password });

            if (response.data.success) {
                const permissions = response.data.permissions;
                const isSuperuser = response.data.is_superuser;

                // Superusers get admin dashboard
                let detectedType;
                if (isSuperuser) {
                    detectedType = 'admin';
                } else {
                    detectedType = detectUserType(permissions);
                }

                if (!detectedType) {
                    return { success: false, message: "No valid permissions found for this user." };
                }

                setUser(response.data.username);
                setUserType(detectedType);
                localStorage.setItem("user", JSON.stringify(response.data.username));
                localStorage.setItem("useremail", JSON.stringify(response.data.useremail));
                localStorage.setItem("login_id", response.data.login_id);
                localStorage.setItem("userType", detectedType);

                return { success: true, userType: detectedType, redirect: DEFAULT_ROUTES[detectedType] };
            }
            return { success: false, message: "Invalid credentials." };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: "Login failed. Please try again." };
        }
    };

    const loginPartner = async (phone, otp) => {
        setupAxiosDefaults();

        try {
            const response = await axios.post("/partners/verify-otp/", { phone, otp });

            if (response.data) {
                setUser(phone);
                setUserType('partners');
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("phone", phone);
                localStorage.setItem("userType", "partners");

                return { success: true, redirect: DEFAULT_ROUTES.partners };
            }
            return { success: false, message: "OTP verification failed." };
        } catch (error) {
            console.error("Partner login failed:", error);
            return { success: false, message: "Verification failed. Please try again." };
        }
    };

    const loginresident = async (phone, password) => {
        try {
            const response = await axios.post("/api/resident-login/", { phone, password });

            if (response.data.success) {
                setUser(phone);
                setUserType('resident');
                localStorage.setItem("residentAccessToken", response.data.access);
                localStorage.setItem("residentRefreshToken", response.data.refresh);
                localStorage.setItem("phone", phone);
                localStorage.setItem("userType", "resident");
                localStorage.setItem("residentData", JSON.stringify({
                    resident_id: response.data.resident_id,
                    residentsName: response.data.residentsName,
                    kycApprovalStatus: response.data.kycApprovalStatus,
                }));

                return { success: true, redirect: DEFAULT_ROUTES.resident };
            }
            return { success: false, message: response.data.message || "Invalid credentials." };
        } catch (error) {
            console.error("resident login failed:", error);
            const msg = error.response?.data?.message || "Login failed. Please try again.";
            return { success: false, message: msg };
        }
    };

    const sendOtp = async (phone) => {
        setupAxiosDefaults();
        try {
            const response = await axios.post("/partners/send-otp/", { phone });
            return { success: true, message: response.data.message || "OTP sent successfully!" };
        } catch (error) {
            console.error("Error sending OTP:", error);
            return { success: false, message: "Error sending OTP." };
        }
    };

    const logout = async () => {
        setupAxiosDefaults();

        const currentType = localStorage.getItem("userType");
        const loginId = localStorage.getItem("login_id");

        if (currentType && currentType !== 'partners') {
            const prefix = API_PREFIX_MAP[currentType];
            try {
                await axios.post(`${prefix}/logout/`, { loginId }, { skipGlobalErrorToast: true });
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }

        clearAuth();
    };

    return (
        <AuthContext.Provider value={{
            user,
            userType,
            isLoading,
            login,
            loginPartner,
            loginresident,
            sendOtp,
            logout,
            DEFAULT_ROUTES,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
