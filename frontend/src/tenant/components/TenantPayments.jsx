import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import { CreditCard } from "lucide-react";

export default function TenantPayments({ isExpanded, setIsExpanded }) {
    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Payments</h1><p>Online rent payment</p></div>
                </div>

                <div className="card">
                    <div className="card-body text-center py-16">
                        <CreditCard size={56} className="mx-auto mb-4 text-[#D4A017]/40" />
                        <h2 className="text-lg font-semibold text-gray-700">Coming Soon</h2>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                            Online rent payments will be available shortly. You'll be able to pay rent securely through UPI, cards, and net banking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
