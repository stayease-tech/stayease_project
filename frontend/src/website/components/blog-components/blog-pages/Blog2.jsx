import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Red Flags to Watch Out for Before Shifting to a Co-Living Space in Bangalore",
    author: "Uma Ghosh",
    date: "Feb 11, 2025",
    readTime: "3 min read",
    mainImage: "/static/img/blog/blog_img3.webp",
    mainImageAlt: "Co-living space warning signs - Red flags to check before moving"
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

// Memoized blog section component
const BlogSection = memo(({ title, children, isNumbered = false }) => (
    <li className='pb-8'>
        {isNumbered ? (
            <h3 className='font-semibold text-lg text-gray-800'>{title}</h3>
        ) : (
            <h3 className='font-semibold text-xl text-gray-800'>{title}</h3>
        )}
        <div className='text-gray-700 leading-relaxed mt-2'>
            {children}
        </div>
    </li>
))

BlogSection.displayName = 'BlogSection'

function Blog2() {
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

            {/* Introduction Paragraph */}
            <p className='pb-8 leading-relaxed text-gray-700'>
                Co-living spaces have become a popular option for students and young
                professionals due to Bangalore's fast-paced lifestyle and exorbitant rental costs.
                Convenience, affordability, and a sense of community are all provided by these
                areas. However, it's crucial to be aware of any warning signs that could ruin your
                experience before taking the leap. Here are five key warning signs to watch out for:
            </p>

            {/* Blog Content Sections */}
            <ul className='space-y-6'>
                {/* Section 1 */}
                <BlogSection title="1. Hidden Costs and Unclear Pricing" isNumbered>
                    <p>
                        Lack of pricing transparency is one of the major warning signs. While promoting
                        affordable monthly rents, some co-living operators subsequently tack on unstated
                        fees for maintenance, utilities, or even the use of communal areas. A thorough
                        explanation of all expenses, including deposits, service fees, and return guidelines,
                        should always be requested. Make sure there are no unforeseen costs by thoroughly
                        reading the agreement.
                    </p>
                </BlogSection>

                {/* Section 2 */}
                <BlogSection title="2. Lack of Proper Licensing and Legal Issues" isNumbered>
                    <p>
                        Verify that the co-living facility has the required licenses and legal clearances before
                        moving in. Some operators operate without the required authorization, which may
                        result in disagreements or unexpected eviction notifications. Verify the legal
                        documents and make sure the property complies with regional regulations.
                    </p>
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
                {/* Section 3 */}
                <BlogSection title="3. Unclear or Restrictive House Rules" isNumbered>
                    <p>
                        Although each co-living facility has its own set of regulations, too stringent ones may
                        make your stay uncomfortable. Certain locations have severe curfews, visitor
                        limitations, or even guidelines on the use of communal spaces during particular
                        times. Make sure the guidelines suit your way of life, particularly if you like hosting
                        people or work late.
                    </p>
                </BlogSection>

                {/* Section 4 */}
                <BlogSection title="4. High-Pressure Sales Tactics from Coordinators" isNumbered>
                    <p>
                        It is an alarming sign if the coordinator or property management is inciting
                        unreasonable urgency when booking the space. Some co-living operators employ
                        high-pressure sales techniques, including inflated claims about limited supply or
                        time-restricted deals that end soon. As a result, prospective residents are unable to
                        reflect, pose crucial queries, or weigh their possibilities. Clear information and ample
                        time to make an informed choice without excessive pressure are hallmarks of a
                        quality co-living environment.
                    </p>
                </BlogSection>

                {/* Section 5 */}
                <BlogSection title="5. Negative Reviews and Resident Feedback" isNumbered>
                    <p>
                        Reading internet reviews and talking to current or former residents are excellent
                        ways to evaluate a co-living facility before moving. Consider it a warning sign if there
                        are several complaints regarding management, delayed maintenance, or
                        disagreements over deposits. Other people's first-hand experiences can assist you
                        steer clear of a poor choice.
                    </p>
                </BlogSection>

                {/* Section 6 - Final Thoughts */}
                <BlogSection title="Final Thoughts">
                    <p>
                        In Bangalore, co-living places might be a fantastic choice if picked carefully. Before
                        making a decision, always go to the property, study reviews, and ask questions. A
                        little preparation might help you avoid unpleasant surprises and guarantee a hassle-
                        free, enjoyable stay.
                    </p>
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

export default memo(Blog2)