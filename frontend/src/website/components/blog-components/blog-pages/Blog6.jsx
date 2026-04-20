import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Rent Right or Regret Later: Why a Rental Agreement is a Must-Have!",
    author: "Uma Ghosh",
    date: "Feb 22, 2025",
    readTime: "3 min read",
    mainImage: "static/img/blog/blog_img7.webp",
    mainImageAlt: "Rental agreement document - Legal contract for property rental"
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

function Blog6() {
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
                    Whether you are the landlord or the renter, renting a property is a big commitment
                    with rights and obligations. However, in the absence of a formal rental agreement,
                    both parties can encounter a number of difficulties that could result in monetary and
                    legal issues. By outlining the terms and circumstances of the rental relationship, a
                    rental agreement acts as a safeguard and makes sure that both landlords and
                    tenants are aware of their responsibilities.
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
            <ul className='space-y-6 pb-10'>
                {/* Main Heading Section */}
                <MainHeadingSection title="Consequences of Not Having a Rental Agreement">
                    Failing to have a written rental agreement can lead to misunderstandings, conflicts,
                    and legal disputes. Here are some key issues that may arise in the absence of a
                    rental contract:
                </MainHeadingSection>

                {/* Section 1 */}
                <NumberedSection title="1. Unregulated Rent Increases">
                    Tenants are left exposed financially since landlords can raise rent at any time without
                    a rental agreement. In order to give tenants certainty and stability, a written contract
                    usually contains provisions that control the frequency and percentage of rent
                    increases.
                </NumberedSection>

                {/* Section 2 */}
                <NumberedSection title="2. Unclear Eviction Rules">
                    The terms under which a landlord may evict a tenant are outlined in a rental
                    agreement. Without one, landlords can find it difficult to get rid of troublesome
                    tenants who break verbal agreements, or tenants might face the possibility of an
                    unexpected eviction. The absence of a written agreement might impede legal
                    processes.
                </NumberedSection>

                {/* Section 3 */}
                <NumberedSection title="3. Property Damage Liability">
                    Without a formal agreement defining the tenant's obligations, the landlord may find it
                    difficult to recoup repair costs if a renter destroys the property. Such costs are
                    typically covered by a security deposit clause in a rental agreement.
                </NumberedSection>

                {/* Section 4 */}
                <NumberedSection title="4. Legal Uncertainty in Disputes">
                    It may be difficult for either side to substantiate their claims in court if the rental
                    agreement is unregistered or missing. A rental agreement is an essential piece of
                    legal documentation in any dispute involving unpaid rent, property damage, or other
                    issues.
                </NumberedSection>

                {/* Section 5 */}
                <NumberedSection title="5. Loss of Tax Benefits">
                    Rental agreements are frequently used by tenants to obtain tax exemptions for the
                    House Rent Allowance (HRA). They might not be able to receive these financial
                    benefits without a legal contract, which would increase their tax obligations.
                </NumberedSection>

                {/* Section 6 */}
                <NumberedSection title="6. Lack of Clarity on Notice Periods and Moving Out">
                    Tenants may vacate at any moment without giving advance warning if there is no
                    agreement in place, leaving landlords with empty homes and monetary losses. The
                    notice period needed to vacate the property is specified in a rental agreement, giving
                    both parties enough time to make the necessary preparations.
                </NumberedSection>

                {/* Conclusion with line breaks */}
                <NumberedSection title="Conclusion">
                    To protect the rights of both landlords and tenants, a rental agreement is necessary.
                    It guarantees responsibility for property damage, guards against arbitrary eviction,
                    helps control rent hikes, and provides legal evidence in court. Landlords can obtain a
                    steady rental income, and tenants can receive tax benefits.
                    <br /><br />
                    Both parties should make sure they develop and sign a rental agreement that
                    precisely describes the terms and circumstances before leasing or renting out a
                    property. A document that is legally enforceable can be created with the assistance
                    of a legal expert, giving everyone concerned piece of mind and protection.
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

export default memo(Blog6)