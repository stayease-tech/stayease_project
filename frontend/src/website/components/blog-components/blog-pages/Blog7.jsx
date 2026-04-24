import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "New City, New Digs? Your Rental Agreement Can Unlock EMIs!",
    author: "Uma Ghosh",
    date: "Feb 22, 2025",
    readTime: "3 min read",
    mainImage: "static/img/blog/blog_img8.webp",
    mainImageAlt: "Rental agreement document for EMI loan approval and financial benefits"
}

// Social share links data (commented out but preserved)
const SOCIAL_SHARE_LINKS = [
    {
        id: 'facebook',
        icon: 'fab fa-facebook',
        title: 'Facebook',
        to: 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore'
    },
    {
        id: 'linkedin',
        icon: 'fab fa-linkedin',
        title: 'LinkedIn',
        to: 'https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore'
    },
    {
        id: 'pinterest',
        icon: 'fab fa-pinterest',
        title: 'Pinterest',
        to: 'https://www.pinterest.com/pin/create/button/?url=https://www.mystayease.com/post/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore'
    },
    {
        id: 'twitter',
        icon: 'fab fa-twitter',
        title: 'Twitter',
        to: 'https://x.com/intent/post?url=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore'
    }
]

// Memoized author info component
const AuthorInfo = memo(({ author, date, readTime, showBorder = false }) => (
    <>
        <h6 className='font-semibold text-gray-800'>{author}</h6>
        <div className='flex gap-7 text-gray-600'>
            <p>{date}</p>
            <ul className='list-disc'>
                <li>{readTime}</li>
            </ul>
        </div>
        {showBorder && <hr className="my-8 border-gray-300" />}
    </>
))

AuthorInfo.displayName = 'AuthorInfo'

// Memoized social share component (commented out but preserved)
const SocialShare = memo(() => (
    <div className='flex gap-8'>
        {SOCIAL_SHARE_LINKS.map(({ id, icon, title, to }) => (
            <div key={id}>
                <Link
                    to={to}
                    target='_blank'
                    title={title}
                    rel="noopener noreferrer"
                    className='hover:text-[#eba312] transition-colors duration-300'
                >
                    <i className={`text-lg ${icon}`} aria-hidden="true" />
                </Link>
            </div>
        ))}
    </div>
))

SocialShare.displayName = 'SocialShare'

// Memoized intro paragraph component
const IntroParagraph = memo(({ children }) => (
    <li className='pb-8'>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

IntroParagraph.displayName = 'IntroParagraph'

// Memoized main heading section
const MainHeadingSection = memo(({ title, children }) => (
    <li className='pb-8'>
        <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-3'>{title}</h3>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

MainHeadingSection.displayName = 'MainHeadingSection'

// Memoized numbered section component
const NumberedSection = memo(({ title, children }) => (
    <li className='pb-8'>
        <h3 className='font-semibold text-lg text-gray-800 mb-2'>{title}</h3>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

NumberedSection.displayName = 'NumberedSection'

// Memoized bullet point section component
const BulletSection = memo(({ title, children }) => (
    <li className='pb-8'>
        <h3 className='font-semibold text-gray-800 mb-1'>{title}</h3>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

BulletSection.displayName = 'BulletSection'

function Blog7() {
    return (
        <div className='bg-white text-black px-[1rem] md:px-[8rem] pb-[3rem] pt-[8rem] min-h-screen'>
            {/* Blog Title */}
            <h1 className='text-xl md:text-3xl lg:text-5xl font-semibold my-3 md:my-5 leading-tight text-gray-900'>
                {BLOG_DATA.title}
            </h1>

            {/* Author Info - Top */}
            <AuthorInfo
                author={BLOG_DATA.author}
                date={BLOG_DATA.date}
                readTime={BLOG_DATA.readTime}
                showBorder={true}
            />

            {/* First Section - Intro paragraph */}
            <ul className='space-y-6'>
                <IntroParagraph>
                    Moving to a new Indian city for work or education is an exciting but difficult
                    experience. One of the top considerations is finding a place to reside, and getting a
                    rental agreement is more than just a formality; it's essential for maintaining both
                    financial stability and legal protection. When applying for an EMI loan, a state-
                    approved rental agreement is especially necessary because banks and other
                    financial institutions view it as a legitimate proof of residency.
                </IntroParagraph>
            </ul>

            {/* Blog Image */}
            <div className='flex justify-center pb-8'>
                <img
                    src={BLOG_DATA.mainImage}
                    alt={BLOG_DATA.mainImageAlt}
                    className="h-[35vh] md:w-[60vw] md:h-[70vh] mt-5 object-cover rounded-lg shadow-lg"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* Content Sections */}
            <ul className='space-y-6 pb-6'>
                {/* Main Heading Section */}
                <MainHeadingSection title="The Role of a Rental Agreement in EMI Approvals">
                    For individuals looking to purchase a vehicle, electronics, or even secure a personal
                    loan, a rental agreement is often a key document required by lenders. Here's why it
                    matters:
                </MainHeadingSection>

                {/* Section 1 */}
                <NumberedSection title="1. Proof of Address">
                    For banks to complete loan applications, a verified
                    residential address is necessary. Recently relocated individuals can more
                    easily confirm their identity by using a state-approved rental agreement as a
                    legitimate proof of residence.
                </NumberedSection>

                {/* Section 2 */}
                <NumberedSection title="2. Creditworthiness Verification">
                    Before granting an EMI-based loan, financial institutions evaluate the stability of the application. A fixed address is indicated by a legally recognized rental agreement, which enhances the borrower's reliability.
                </NumberedSection>

                {/* Section 3 */}
                <NumberedSection title="3. KYC Compliance">
                    Know Your Customer (KYC) documentation are required by lenders in order to guard against fraud. A state-approved rental agreement is generally regarded as a legitimate document, which facilitates the processing of loan applications.
                </NumberedSection>

                {/* Section 4 */}
                <NumberedSection title="4. Ease of Utility Connections">
                    A rental agreement is frequently required
                    when applying for gas, water, electricity, or internet services. Indirectly
                    supporting EMI approvals by demonstrating stability, a legal document
                    guarantees hassle-free approvals for these crucial services.
                </NumberedSection>
            </ul>

            {/* Why State-Approved Section */}
            <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-3'>Why a State-Approved Rental Agreement Matters</h3>
            <p className='text-gray-700 leading-relaxed mb-6'>
                A rental agreement isn't just a piece of paper—it carries legal significance and
                serves multiple purposes beyond securing accommodation. Here's why a state-
                registered rental agreement is particularly important:
            </p>

            {/* Bullet Points Section */}
            <ul className='pb-10 space-y-6 pl-5 list-disc'>
                <BulletSection title="Legal Protection:">
                    A registered agreement gives both the landlord and the renter legal support in the event that disagreements develop.
                </BulletSection>

                <BulletSection title="HRA Claims:">
                    When submitting income tax returns, salaried workers may utilize the rental agreement to claim deductions for the House Rent Allowance (HRA).
                </BulletSection>

                <BulletSection title="Prevents Arbitrary Rent Increases & Evictions:">
                    In the absence of a contract, landlords have the right to raise rent or remove residents at any time. Clear terms and conditions are established in a written contract.
                </BulletSection>

                <BulletSection title="Easy Relocation Process:">
                    A rental agreement is an essential document for administrative reasons since many government agencies, institutions, and companies need confirmation of residency.
                </BulletSection>
            </ul>

            {/* Steps Section */}
            <ul className='pb-10 space-y-6'>
                <li className='pb-2'>
                    <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-4'>Steps to Get a State-Approved Rental Agreement</h3>
                </li>

                <NumberedSection title="1. Draft the Agreement">
                    Include key details like rent amount, security deposit, lease duration, and resident-landlord responsibilities.
                </NumberedSection>

                <NumberedSection title="2. Get It Notarized or Registered">
                    A notarized agreement is useful, but a registered rental agreement (at the local sub-registrar's office) carries more legal weight.
                </NumberedSection>

                <NumberedSection title="3. Submit for EMI Applications">
                    Once registered, the document can be used for various financial and legal purposes, including applying for loans.
                </NumberedSection>

                {/* Conclusion */}
                <NumberedSection title="Conclusion">
                    A rental agreement is more than simply a housing contract for Indians relocating to a
                    new location; it is essential for financial planning, EMI security, and legal security. A
                    state-approved rental agreement is a crucial document for anyone looking for
                    stability in a new area because it lends legitimacy, streamlines credit applications,
                    and offers peace of mind.
                </NumberedSection>
            </ul>

            {/* Author Info - Bottom */}
            <AuthorInfo
                author={BLOG_DATA.author}
                date={BLOG_DATA.date}
                readTime={BLOG_DATA.readTime}
            />

            <hr className="my-8 border-gray-300" />

            {/* Social Share - Commented out as in original */}
            {/* <SocialShare /> */}
        </div>
    )
}

export default memo(Blog7)