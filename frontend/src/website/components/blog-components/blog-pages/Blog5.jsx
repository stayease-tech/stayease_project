import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Women-Friendly Coliving Spaces: A Safe Haven for Independent Living",
    author: "Uma Ghosh",
    date: "Feb 22, 2025",
    readTime: "3 min read",
    mainImage: "/static/img/blog/blog_img6.webp",
    mainImageAlt: "Women-friendly coliving space - Safe and inclusive shared accommodation for women"
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

// Memoized intro paragraph component (no title)
const IntroParagraph = memo(({ children }) => (
    <li className='pb-8'>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

IntroParagraph.displayName = 'IntroParagraph'

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

function Blog5() {
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

            {/* First Section - Intro paragraph without title */}
            <ul className='space-y-6'>
                <IntroParagraph>
                    More women are relocating to cities in today's fast-paced world in search of
                    independence, education, and employment prospects. Nonetheless, locating secure
                    and cozy lodging continues to be a major worry. Conventional rental alternatives can
                    make independent women feel uneasy since they frequently have safety concerns,
                    restricted restrictions, or even a judgmental atmosphere. Coliving spaces fill this
                    need by providing a welcome substitute that places an emphasis on security,
                    inclusion, and a judgment-free environment.
                </IntroParagraph>

                {/* Section 1 */}
                <BlogSection title="Safety First: A Secure Living Environment">
                    Coliving spaces' emphasis on security is one of their main benefits. To make sure
                    residents feel safe, the majority of coliving facilities provide 24-hour security, CCTV
                    monitoring, biometric access, and on-site personnel. Coliving spaces offer a
                    controlled security framework, which makes them a favored option for women who
                    wish to live independently without sacrificing their wellbeing, in contrast to traditional
                    PGs or renting flats where safety might be an issue.
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
                <BlogSection title="A Community Without Judgment">
                    Unspoken cultural expectations—questions about visitors, late-night entrances, or
                    even lifestyle choices—come with many traditional lodgings. Conversely, coliving
                    places promote a progressive and accepting atmosphere. Without needless
                    monitoring or obtrusive landlords, women can live their lives as they see fit. These
                    areas promote independence and personal development, enabling inhabitants to
                    concentrate on their studies, jobs, and general well-being free from other influences.
                </BlogSection>

                {/* Section 3 */}
                <BlogSection title="Supportive and Like-Minded Community">
                    Coliving has the advantage of a built-in group, but living alone in a new place can be
                    daunting. Like-minded people congregate in these areas, fostering an atmosphere of
                    encouragement and support. In order to assist women meet people, make friends,
                    and establish a solid support network in a new place, many coliving facilities host
                    social gatherings, networking activities, and health initiatives.
                </BlogSection>

                {/* Section 4 */}
                <BlogSection title="Convenience and Comfort">
                    With fully furnished rooms, housekeeping, fast internet, and shared amenities like
                    kitchens and lounges, coliving spaces are meant to be hassle-free places to live.
                    Without having to worry about everyday tasks, upkeep, or safety issues, women can
                    have comfortable lives. Because of this convenience, they can concentrate on their
                    social lives, occupations, and passions rather than having to worry about running a
                    household by themselves.
                </BlogSection>

                {/* Section 5 - With line break */}
                <BlogSection title="An Inclusive and Progressive Future">
                    Coliving spaces have revolutionized urban housing as a result of the increase in
                    female professionals, entrepreneurs, and students seeking independent living. By
                    giving them a safe, accepting, and judgment-free atmosphere in which to flourish,
                    they empower women. These areas will be essential in redefining contemporary
                    living as cities expand, making sure that women feel appreciated, safe, and at home.
                    <br /><br />
                    Coliving spaces provide the perfect answer for women looking for a location that
                    prioritizes comfort, security, and individual freedom—a home away from home where
                    safety is always maintained and independence is valued.
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

export default memo(Blog5)