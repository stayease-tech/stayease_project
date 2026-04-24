import { Link } from 'react-router-dom'
import { memo } from 'react'

// Static footer link data - defined outside component to prevent recreation
const COMPANY_LINKS = [
    { name: 'About', to: '/about' },
    { name: 'Our Properties', to: '/properties' },
    { name: 'Blog', to: '/blog' },
    { name: 'Contact', to: '/contact' },
]

const SERVICE_LINKS = [
    { name: 'Privacy Policy', to: '/privacy-policy' },
    { name: 'Terms & Conditions', to: '/Terms-conditions' },
    { name: 'Refund & Cancellation Policy', to: '/refund-policy' },
    { name: 'Cookie Policy', to: '/privacy-policy' },
    { name: 'Resident Login', to: '/resident-login' },
]

const SOCIAL_LINKS = [
    { to: "https://www.facebook.com/stayeasee?mibextid=ZbWKwL", icon: "fab fa-facebook-f", title: "Facebook" },
    { to: "https://www.instagram.com/stayease_/", icon: "fab fa-instagram", title: "Instagram" },
    { to: "https://www.linkedin.com/company/stayease/", icon: "fab fa-linkedin", title: "LinkedIn" }
]

// Memoized social links to prevent re-renders
const SocialLinks = memo(() => (
    <div className="flex justify-left space-x-8 mt-5 ps-3 md:ps-4">
        {SOCIAL_LINKS.map(({ to, icon, title }) => (
            <Link
                key={title}
                to={to}
                target="_blank"
                title={title}
                rel="noopener noreferrer"
                className="text-2xl text-white hover:text-[#eba312] transition-colors duration-200"
            >
                <i className={icon} aria-hidden="true" />
            </Link>
        ))}
    </div>
))

SocialLinks.displayName = 'SocialLinks'

// Memoized contact info section
const ContactInfo = memo(() => (
    <ul>
        <li className='mb-5'>
            <div className="flex space-x-5 pe-20">
                <i className="text-xl fa-solid fa-location-dot w-6" aria-hidden="true"></i>
                <p>​No. 216,215, 3rd Cross, Off Neeladri Road, Electronic City Phase 1, Bengaluru 560100</p>
            </div>
        </li>
        <li className='mb-5'>
            <div className="flex space-x-4">
                <i className="text-xl fa-solid fa-phone w-6" aria-hidden="true"></i>
                <p>
                    <Link
                        to={`https://wa.me/9164648787`}
                        className='hover:text-[#eba312] transition-colors duration-200'
                        rel="noopener noreferrer"
                    >
                        +91 91 6464 8787
                    </Link>
                </p>
            </div>
        </li>
        <li className='mb-5'>
            <div className="flex space-x-4">
                <i className="text-xl far fa-envelope w-6" aria-hidden="true"></i>
                <p>
                    <Link
                        to={`mailto:hello@mystayease.com`}
                        className='hover:text-[#eba312] transition-colors duration-200'
                    >
                        hello@mystayease.com
                    </Link>
                </p>
            </div>
        </li>
    </ul>
))

ContactInfo.displayName = 'ContactInfo'

// Memoized link section component for reusability
const LinkSection = memo(({ title, links }) => (
    <div>
        <h4 className="text-2xl font-semibold md:font-bold text-[#eba312]">{title}</h4>
        <div className="mt-5">
            <ul>
                {links.map(({ name, to }) => (
                    <li key={name} className='mb-5'>
                        <Link
                            className='font-base md:font-semibold hover:text-[#eba312] transition-colors duration-200'
                            to={to}
                        >
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    </div>
))

LinkSection.displayName = 'LinkSection'

const Footer = () => {
    return (
        <footer className="border-t-2 border-[#eba312]">
            <div className='p-5 md:p-20'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-5 text-white'>
                    {/* Company Info - spans 3 columns on desktop */}
                    <div className="md:col-span-3 mb-5 md:mb-0">
                        {/* Logo with explicit dimensions */}
                        <div>
                            <img
                                src="static/img/brand-logo/stayEase-Logo.webp"
                                className='object-cover'
                                width="180"
                                height="60"
                                loading="lazy"
                                decoding="async"
                                alt="StayEase_Logo"
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="mt-3 ps-3 md:ps-4">
                            <ContactInfo />
                        </div>

                        {/* Social Media Links */}
                        <SocialLinks />
                    </div>

                    {/* Company Links Section */}
                    <LinkSection title="Company" links={COMPANY_LINKS} />

                    {/* Services Links Section */}
                    <LinkSection title="Services" links={SERVICE_LINKS} />
                </div>
            </div>

            {/* Copyright footer */}
            <div className="pb-8 text-center text-sm text-gray-400">
                <p>©2024 Estanzia Ease Private Limited, All rights reserved</p>
            </div>
        </footer>
    )
}

export default memo(Footer)