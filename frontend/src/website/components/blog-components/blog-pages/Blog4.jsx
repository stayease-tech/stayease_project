import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Coliving vs PGs & Rented Flats: The Smarter Choice for Young Professionals",
    author: "Uma Ghosh",
    date: "Feb 11, 2025",
    readTime: "3 min read",
    mainImage: "/static/img/blog/blog_img5.webp",
    mainImageAlt: "Modern coliving space vs traditional PG - Comparison for young professionals"
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

// Memoized blog section with title component
const BlogSection = memo(({ title, children }) => (
    <li className='pb-8'>
        <h3 className='font-semibold text-lg text-gray-800 mb-2'>{title}</h3>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

BlogSection.displayName = 'BlogSection'

// Memoized intro section (no title)
const IntroSection = memo(({ children }) => (
    <li className='pb-8'>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

IntroSection.displayName = 'IntroSection'

function Blog4() {
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

            {/* First Section - Introduction with title */}
            <ul className='space-y-6'>
                <BlogSection title="Why Choose Coliving Over PGs or Rented Apartments?">
                    Finding the perfect living space in a city like Bangalore can be challenging,
                    especially for young professionals. While traditional PGs and rented apartments
                    have been common choices, coliving spaces are quickly emerging as a preferred
                    alternative. They offer affordability, convenience, and a vibrant social environment
                    that make urban living more enjoyable. Here's why coliving is a smarter choice over
                    PGs or rented flats:
                </BlogSection>

                {/* Section 1 */}
                <BlogSection title="1. The Social Benefits of Coliving">
                    Coliving spaces, as opposed to conventional PGs or rented flats, promote a strong
                    sense of community. Through community activities, coworking spaces, and shared
                    common areas, they are intended to promote social interactions. This arrangement
                    provides a fantastic option for young professionals who have relocated to a new
                    place to network, meet people, and fight loneliness. Renting an apartment can feel
                    lonely, especially if you live alone, and PGs frequently have strict restrictions that
                    restrict social interaction.
                </BlogSection>
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

            {/* Remaining Content Sections */}
            <ul className='space-y-6 pb-10'>
                {/* Section 2 */}
                <BlogSection title="2. Lower Security Deposits">
                    The large security deposit, which can equal six to ten months' rent (usually between
                    ₹60,000 and ₹80,000 or more in Bangalore), is one of the largest financial burdens
                    associated with renting an apartment. Coliving facilities, on the other hand, demand
                    small deposits, typically equal to one or two months' rent. This makes moving into a
                    coliving environment much more accessible and greatly lessens the initial cost
                    burden.
                </BlogSection>

                {/* Section 3 */}
                <BlogSection title="3. Enjoy the Feeling of Home Without the High Costs">
                    You may have your own apartment without having to pay the exorbitant rent prices
                    by living in a coliving facility. High deposits are frequently required for rented flats, in
                    addition to extra costs for utilities, furniture, appliances, and upkeep. In contrast,
                    coliving facilities provide fully equipped rooms with housekeeping, maintenance, and
                    Wi-Fi all included in the price, making living there hassle-free.
                </BlogSection>

                {/* Section 4 */}
                <BlogSection title="4. A Budget-Friendly Living Option">
                    Effective cost management is essential for young professionals. Despite their
                    apparent cost-effectiveness, PGs frequently have unstated expenses like as
                    maintenance fees, food expenditures, and electricity bills. Wi-Fi, utilities, and other
                    services must be paid for separately in rented flats. Coliving places make it easier to
                    budget your monthly spending by providing an all-inclusive leasing model where you
                    pay a set price that covers everything.
                </BlogSection>

                {/* Section 5 */}
                <BlogSection title="5. Non-Judgmental and Couple-Friendly Environment">
                    Residents, particularly couples, are subject to restrictive boundaries in many
                    conventional PGs and even some rental apartments. On the other hand, coliving
                    places are intended to be welcoming and inclusive. They offer a judgment-free
                    atmosphere where locals can live freely without needless limitations on guests,
                    visitors, or personal preferences. Because of this, coliving is a more progressive and
                    accommodative choice for contemporary city people.
                </BlogSection>

                {/* Section 6 */}
                <BlogSection title="6. 24/7 Housekeeping Services">
                    The availability of housekeeping and maintenance services around-the-clock is one
                    of the key benefits of coliving spaces. It can be time-consuming and unreliable to
                    employ and handle domestic staff individually in rented residences. Common areas
                    in PGs are frequently unclean. Coliving facilities have a professional cleaning crew
                    and uphold high standards of hygiene, guaranteeing a tidy and comfortable living
                    place.
                </BlogSection>

                {/* Section 7 */}
                <BlogSection title="7. Prime Locations with Easy Commute">
                    Long journeys to work are a common problem for young professionals. Coliving
                    facilities are usually found in desirable locations, close to business districts, IT
                    clusters, and public transportation. This helps workers maintain a better work-life
                    balance in addition to cutting down on commute time. Coliving facilities provide
                    reasonably priced lodging in these in-demand places, yet renting an apartment in
                    these areas can be costly.
                </BlogSection>

                {/* Section 8 - Concluding Thoughts */}
                <BlogSection title="Concluding Thoughts">
                    The way young professionals live in urban areas is being redefined by coliving. It
                    offers a smooth and affordable substitute for PGs and rented flats thanks to its
                    cheaper deposits, all-inclusive rent, social advantages, and contemporary
                    conveniences. Coliving is the way to go whether you're new to Bangalore or seeking
                    a lively and hassle-free living environment!
                </BlogSection>
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

export default memo(Blog4)