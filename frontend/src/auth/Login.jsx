import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("staff");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Staff login state
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    // Partner login state
    const [partnerData, setPartnerData] = useState({ phone: "", otp: "" });

    // Tenant login state
    const [tenantData, setTenantData] = useState({ phone: "", password: "" });

    // If already logged in, redirect to dashboard
    if (auth.user && auth.userType) {
        return <Navigate to={auth.DEFAULT_ROUTES[auth.userType]} replace />;
    }

    const handleStaffChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePartnerChange = (e) => {
        const { name, value } = e.target;
        setPartnerData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTenantChange = (e) => {
        const { name, value } = e.target;
        setTenantData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const result = await auth.login(loginData.username, loginData.password);

        if (result.success) {
            navigate(result.redirect);
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    const handleSendOtp = async () => {
        if (!partnerData.phone) {
            setError("Please enter your phone number.");
            return;
        }
        setIsSendingOtp(true);
        setError("");

        const result = await auth.sendOtp(partnerData.phone);
        if (result.success) {
            setOtpSent(true);
        } else {
            setError(result.message);
        }
        setIsSendingOtp(false);
    };

    const handlePartnerSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const result = await auth.loginPartner(partnerData.phone, partnerData.otp);

        if (result.success) {
            navigate(result.redirect);
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    const handleTenantSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const result = await auth.loginTenant(tenantData.phone, tenantData.password);

        if (result.success) {
            navigate(result.redirect);
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient mesh */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.15),transparent_70%)]" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(184,134,11,0.1),transparent_70%)]" />
                <div className="absolute top-1/4 right-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.08),transparent_60%)]" />

                {/* Floating shapes */}
                <div className="absolute top-[10%] left-[8%] w-72 h-72 bg-[#D4A017]/10 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite_1s]" />
                <div className="absolute top-[50%] left-[50%] w-64 h-64 bg-[#B8860B]/5 rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite_2s]" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Decorative geometric lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" />
                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="1" />
                    <circle cx="50%" cy="50%" r="30%" stroke="white" strokeWidth="0.5" fill="none" />
                    <circle cx="50%" cy="50%" r="20%" stroke="white" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            {/* Navbar */}
            <nav className="bg-[#0A0A0A]/80 backdrop-blur-md shadow-md fixed w-full top-0 z-[100] border-b border-white/5">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex justify-center h-14 sm:h-16 items-center">
                        <img
                            alt="StayEase"
                            src="/static/img/brand_logo/stayEase-Logo.webp"
                            className="h-8 sm:h-10 w-auto object-contain max-w-[180px] sm:max-w-none"
                            loading="lazy"
                        />
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center pt-16 sm:pt-20 px-4 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden">
                        {/* Header */}
                        <div className="text-center pt-8 pb-4 px-8">
                            <div className="w-14 h-14 mx-auto mb-4 bg-[#FDF6E3] text-[#D4A017] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A017]/20">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">StayEase</h1>
                            <p className="text-sm text-gray-500 mt-1">Property Management System</p>
                        </div>

                        {/* Tab Buttons */}
                        <div className="flex mx-8 mb-0 bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === "staff"
                                        ? "bg-white text-[#D4A017] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => { setActiveTab("staff"); setError(""); }}
                            >
                                Staff Login
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === "partner"
                                        ? "bg-white text-[#D4A017] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => { setActiveTab("partner"); setError(""); setOtpSent(false); }}
                            >
                                Partner Login
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === "tenant"
                                        ? "bg-white text-[#D4A017] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => { setActiveTab("tenant"); setError(""); }}
                            >
                                Tenant Login
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Staff Login Form */}
                        {activeTab === "staff" && (
                            <form className="p-8" onSubmit={handleStaffSubmit} onKeyDown={(e) => { if (e.key === "Enter" && !isSubmitting) { e.preventDefault(); handleStaffSubmit(e); } }}>
                                <div className="mb-5">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={loginData.username}
                                        onChange={handleStaffChange}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                                        placeholder="Enter your username"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={loginData.password}
                                            onChange={handleStaffChange}
                                            className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4A017] transition-colors"
                                            onClick={() => setShowPassword((p) => !p)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-2.5 bg-[#D4A017] text-black text-sm font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </button>
                            </form>
                        )}

                        {/* Partner Login Form */}
                        {activeTab === "partner" && (
                            <form className="p-8" onSubmit={handlePartnerSubmit} onKeyDown={(e) => { if (e.key === "Enter" && !isSubmitting) { if (!otpSent) { e.preventDefault(); handleSendOtp(); } } }}>
                                <div className="mb-5">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={partnerData.phone}
                                        onChange={handlePartnerChange}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors disabled:opacity-60 disabled:bg-gray-50"
                                        placeholder="Enter your phone number"
                                        required
                                        disabled={otpSent}
                                    />
                                </div>

                                {!otpSent ? (
                                    <button
                                        type="button"
                                        className="w-full py-2.5 bg-[#D4A017] text-black text-sm font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 shadow-sm"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                    >
                                        {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                ) : (
                                    <>
                                        <div className="mb-5">
                                            <label htmlFor="otp" className="block text-sm font-medium text-gray-600 mb-1.5">
                                                OTP
                                            </label>
                                            <input
                                                type="text"
                                                id="otp"
                                                name="otp"
                                                value={partnerData.otp}
                                                onChange={handlePartnerChange}
                                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                                                placeholder="Enter the OTP"
                                                required
                                            />
                                        </div>

                                        <button
                                            className="w-full py-2.5 bg-[#D4A017] text-black text-sm font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 shadow-sm"
                                            disabled={isSubmitting}
                                            type="submit"
                                        >
                                            {isSubmitting ? "Verifying..." : "Verify & Login"}
                                        </button>

                                        <button
                                            type="button"
                                            className="mt-3 w-full text-sm text-gray-500 hover:text-[#D4A017] transition-colors"
                                            onClick={() => { setOtpSent(false); setPartnerData({ phone: "", otp: "" }); }}
                                        >
                                            Change Phone Number
                                        </button>
                                    </>
                                )}
                            </form>
                        )}

                        {/* Tenant Login Form */}
                        {activeTab === "tenant" && (
                            <form className="p-8" onSubmit={handleTenantSubmit} onKeyDown={(e) => { if (e.key === "Enter" && !isSubmitting) { e.preventDefault(); handleTenantSubmit(e); } }}>
                                <div className="mb-5">
                                    <label htmlFor="tenantPhone" className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="tenantPhone"
                                        name="phone"
                                        value={tenantData.phone}
                                        onChange={handleTenantChange}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="tenantPassword" className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="tenantPassword"
                                            name="password"
                                            value={tenantData.password}
                                            onChange={handleTenantChange}
                                            className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4A017] transition-colors"
                                            onClick={() => setShowPassword((p) => !p)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-2.5 bg-[#D4A017] text-black text-sm font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </button>
                            </form>
                        )}
                    </div>
                    {/* Footer tagline */}
                    <p className="text-center text-neutral-500 text-xs mt-6 mb-4">
                        Secure login &bull; 256-bit encrypted &bull; StayEase &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
