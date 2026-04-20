import Navbar from "../website/components/global-components/Navbar";
import Footer from "../website/components/global-components/Footer";
import DefaultScrollToTop from "../website/components/global-components/DefaultScrollToTop";
import ScrollToTop from "../website/components/global-components/ScrollToUp";
import { PropertyProvider } from "../website/components/contexts/PropertyContext";

function PublicLayout({ children }) {
    return (
        <div className="text-sm md:text-base bg-[#000000] text-white">
            <Navbar />
            <DefaultScrollToTop />
            <PropertyProvider>
                {children}
            </PropertyProvider>
            <Footer />
            <ScrollToTop />
        </div>
    );
}

export default PublicLayout;
