import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../../auth/AuthContext";

export default function TenantLogin() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (auth.user && auth.userType) {
    return <Navigate to={auth.DEFAULT_ROUTES[auth.userType]} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await auth.loginTenant(formData.phone, formData.password);
    if (result.success) {
      navigate(result.redirect);
    } else {
      setError(result.message || "Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <section className="min-h-screen bg-[#0A0A0A] pt-28 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden">
          <div className="text-center pt-8 pb-4 px-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#FDF6E3] text-[#D4A017] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A017]/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Tenant Login</h1>
            <p className="text-sm text-gray-500 mt-1">Access your StayEase tenant portal</p>
          </div>

          {error && (
            <div className="mx-8 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form className="p-8" onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 focus:outline-none transition-colors"
                placeholder="Enter your phone number"
                required
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
                  value={formData.password}
                  onChange={handleChange}
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
        </div>
      </div>
    </section>
  );
}
