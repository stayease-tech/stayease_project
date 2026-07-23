import { useState, useEffect, useCallback, useRef, memo } from 'react'
import stayeaseLogo from '/static/img/brand-logo/stayEase-Logo.webp'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'

// Static navigation menu items - defined outside component to prevent recreation on each render
const navigation = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Properties', to: '/properties' },
    { name: 'Blog', to: '/blog' },
    { name: 'Contact', to: '/contact' },
]

const RESIDENT_PORTAL_LINK = { name: 'Resident Login', to: '/resident-login' }

// Memoized social links component - only re-renders when isMobile prop changes
const SocialLinks = memo(({ isMobile = false }) => {
    const socialLinks = [
        { to: "https://www.facebook.com/stayeasee?mibextid=ZbWKwL", icon: "fab fa-facebook-f", title: "Facebook" },
        { to: "https://www.instagram.com/stayease_/", icon: "fab fa-instagram", title: "Instagram" },
        { to: "https://www.linkedin.com/company/stayease/", icon: "fab fa-linkedin", title: "LinkedIn" }
    ]

    const containerClasses = isMobile
        ? "flex justify-left space-x-8 px-8 pb-5 pt-5"
        : "flex space-x-8"

    return (
        <div className={containerClasses}>
            {socialLinks.map(({ to, icon, title }) => (
                <Link
                    key={title}
                    to={to}
                    target="_blank"
                    className="text-2xl text-white hover:text-[#eba312] transition-colors duration-200"
                    title={title}
                    rel="noopener noreferrer"
                >
                    <i className={icon} aria-hidden="true" />
                </Link>
            ))}
        </div>
    )
})

SocialLinks.displayName = 'SocialLinks'

// Utility for conditional class merging
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)        // Mobile menu state
    const [isVisible, setIsVisible] = useState(true)    // Navbar visibility based on scroll
    const lastScrollRef = useRef(0)                     // Tracks scroll without causing re-renders
    const location = useLocation()

    // Scroll handler with ref to prevent re-renders during scrolling
    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.pageYOffset
        const isScrollingDown = currentScrollPosition > lastScrollRef.current
        const scrolledPastThreshold = currentScrollPosition > 80

        if (isScrollingDown && scrolledPastThreshold) {
            setIsVisible(false)      // Hide when scrolling down past threshold
        } else if (!isScrollingDown) {
            setIsVisible(true)       // Show when scrolling up
        }

        lastScrollRef.current = currentScrollPosition
    }, []) // Empty deps because ref doesn't trigger re-renders

    // Passive listener for better scroll performance
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    return (
        <nav
            className={`bg-[#000000] border-b-2 border-[#eba312] shadow fixed w-full top-0 z-[100] transition-opacity duration-300 will-change-transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Main navigation"
        >
            <div className="h-24 p-2">
                <div className="flex h-full justify-around items-center">
                    {/* Logo with explicit dimensions to prevent layout shift */}
                    <img
                        alt="StayEase_Logo"
                        src={stayeaseLogo}
                        width="72"
                        height="72"
                        className="h-18 w-auto object-cover"
                        fetchPriority="high"
                        decoding="async"
                    />

                    {/* Desktop navigation */}
                    <div className="hidden md:block">
                        <div className="flex space-x-4">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.to

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.to}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={classNames(
                                            isActive ? 'text-[#eba312]' : 'text-white hover:text-[#eba312]',
                                            'text-[0.9rem] lg:text-[1rem] rounded-md px-3 py-2 font-medium transition-colors duration-200'
                                        )}>
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Desktop social links */}
                    <div className="hidden md:block">
                        <SocialLinks />
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(prev => !prev)}
                            className="group relative inline-flex items-center justify-center rounded-md p-2 border-2 border-white text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? (
                                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                            ) : (
                                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            <div
                className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
                aria-hidden={!isOpen}
            >
                {/* Mobile navigation links */}
                <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.to;

                        return (
                            <Link
                                key={item.name}
                                to={item.to}
                                className={`${isActive
                                        ? 'bg-[#282b38] text-[#eba312]'
                                        : 'text-white hover:bg-[#282b38] hover:text-[#eba312]'
                                    } block rounded-md px-3 py-2 text-[1rem] font-medium transition-colors duration-200`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="mt-3 border-t border-white/10 pt-3 px-1">
                        <Link
                            to={RESIDENT_PORTAL_LINK.to}
                            className="block rounded-md px-3 py-2 text-sm font-medium text-[#eba312] hover:bg-[#282b38]"
                        >
                            {RESIDENT_PORTAL_LINK.name}
                        </Link>
                    </div>
                </div>

                {/* Mobile social links */}
                <SocialLinks isMobile />
            </div>
        </nav>
    )
}
