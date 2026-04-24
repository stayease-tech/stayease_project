import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Top Benefits of Co-Living or Sharing Accommodation for Millennials in Bangalore",
    author: "Rithan Gowda C",
    date: "Sep 8",
    readTime: "3 min read",
    mainImage: "static/img/blog/blog_img2.webp",
    mainImageAlt: "Co-living space in Bangalore - Modern shared accommodation"
}

// Social share links data
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
        <h6 className='font-semibold'>{author}</h6>
        <div className='flex gap-7'>
            <p>{date}</p>
            <ul className='list-disc'>
                <li>{readTime}</li>
            </ul>
        </div>
        {showBorder && <hr className="my-8" />}
    </>
))

AuthorInfo.displayName = 'AuthorInfo'

// Memoized social share component
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
            <h3 className='font-semibold'>{title}</h3>
        ) : (
            <h3 className='font-semibold text-lg'>{title}</h3>
        )}
        {children}
    </li>
))

BlogSection.displayName = 'BlogSection'

function Blog1() {
    return (
        <div className='bg-white text-black px-[1rem] md:px-[8rem] pb-[3rem] pt-[8rem]'>
            {/* Blog Title */}
            <h1 className='text-xl md:text-3xl lg:text-5xl font-semibold my-3 md:my-5 leading-tight'>
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
            <p className='pb-8 leading-relaxed'>
                The housing landscape in urban areas is rapidly changing, and one trend that has caught on with millennials is co-living. Coliving spaces offer a modern solution to housing woes by providing affordable, community-driven accommodations where residents share amenities and spaces. Bangalore, especially neighborhoods like Electronic City, has become a hub for coliving enthusiasts. Let's explore the top benefits of coliving for millennials and why Bangalore is an ideal city to embrace this lifestyle.
            </p>

            {/* Blog Content Sections */}
            <ul className='space-y-8'>
                {/* Section 1 */}
                <BlogSection title="1. Affordability and Cost-Effectiveness" isNumbered>
                    <p className='leading-relaxed'>
                        One of the primary benefits of coliving is its affordability. For millennials who are just starting out in their careers, high rents in metropolitan cities can be overwhelming. Coliving spaces in Bangalore offer a budget-friendly solution. By sharing common areas such as kitchens, living rooms, and utilities, residents save a significant amount on monthly expenses. This makes coliving the best choice for those looking to cut costs without compromising on comfort or location.
                    </p>
                </BlogSection>

                {/* Section 2 */}
                <BlogSection title="2. Prime Locations at Affordable Prices" isNumbered>
                    <p className='leading-relaxed'>
                        Bangalore's Electronic City is a prime example of an area where coliving spaces thrive. Known as the IT hub of the city, Electronic City offers proximity to top multinational companies. Finding an individual apartment in such a coveted location could be expensive, but coliving spaces provide affordable accommodations, allowing millennials to live close to work without burning a hole in their pockets.{' '}
                        <span className='font-semibold'>
                            Hive Harmonia is the{' '}
                            <Link
                                to='/stayease-harmonia'
                                target='_blank'
                                className='underline text-[#125ce2] hover:text-[#eba312] transition-colors duration-300'
                            >
                                Best coliving spaces in Electronic City
                            </Link>
                        </span>{' '}
                        offer all the perks of a prime location with the affordability that sharing accommodations provide.
                    </p>
                </BlogSection>

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

                {/* Section 3 */}
                <BlogSection title="3. Community and Networking Opportunities" isNumbered>
                    <p className='leading-relaxed'>
                        In today's digital world, social isolation is becoming more common. Coliving spaces provide a built-in community where residents can interact, share experiences, and network. For millennials new to a city like Bangalore, this social aspect can be invaluable. Many coliving spaces organize events, workshops, and community activities that foster interaction and bonding among residents. It's an excellent opportunity for professionals, freelancers, and entrepreneurs to connect and collaborate.
                    </p>
                </BlogSection>

                {/* Section 4 */}
                <BlogSection title="4. Flexible Lease Terms" isNumbered>
                    <p className='leading-relaxed'>
                        Traditional rentals often come with rigid contracts and long-term commitments, which can be off-putting for millennials who value flexibility. Most coliving spaces in Bangalore offer flexible lease terms that cater to short-term stays or month-to-month agreements. This flexibility is ideal for those who may be relocating for work, on a temporary assignment, or simply don't want to commit to long-term rentals.
                    </p>
                </BlogSection>

                {/* Section 5 */}
                <BlogSection title="5. Fully Furnished and Managed Properties" isNumbered>
                    <p className='leading-relaxed'>
                        Moving to a new city can be stressful, especially when it comes to setting up a new home. One of the top benefits of coliving is that most spaces are fully furnished and managed. From high-speed WiFi, housekeeping services, to maintenance, coliving spaces in Bangalore take care of all the hassle. This leaves millennials free to focus on their work, studies, or social life rather than worrying about managing their living space.
                    </p>
                </BlogSection>

                {/* Section 6 */}
                <BlogSection title="6. Convenience and Amenities" isNumbered>
                    <p className='leading-relaxed'>
                        Coliving spaces are designed with convenience in mind. They typically offer shared amenities such as gyms, laundry facilities, communal kitchens, and entertainment areas. Some of the{' '}
                        <Link
                            to='/stayease-harmonia'
                            target='_blank'
                            className='underline text-[#125ce2] hover:text-[#eba312] transition-colors duration-300'
                        >
                            Best Coliving spaces in Electronic City
                        </Link>{' '}
                        even come with added perks like coworking areas, modular kitchen, and cafes. This combination of living and leisure creates an environment that suits the millennial lifestyle, blending work, play, and relaxation under one roof.
                    </p>
                </BlogSection>

                {/* Section 7 */}
                <BlogSection title="7. Sustainable Living" isNumbered>
                    <p className='leading-relaxed'>
                        Millennials are known for being environmentally conscious, and coliving spaces provide an eco-friendly living solution. Shared spaces mean fewer resources are consumed per person. Many coliving spaces in Bangalore adopt sustainable practices such as energy-efficient appliances, waste management systems, and promoting a sharing economy. This allows millennials to minimize their environmental footprint while enjoying modern comforts.
                    </p>
                </BlogSection>

                {/* Section 8 */}
                <BlogSection title="8. Safety and Security" isNumbered>
                    <p className='leading-relaxed'>
                        For millennials moving to a new city like Bangalore, safety is a top concern. Most coliving spaces come equipped with security features such as CCTV, access control systems, and on-site security personnel. This ensures a secure living environment, giving residents peace of mind.
                    </p>
                </BlogSection>

                {/* Section 9 */}
                <BlogSection title="Why Coliving in Bangalore is Ideal for Millennials ?">
                    <p className='leading-relaxed'>
                        The demand for coliving spaces in Bangalore is rising, especially in tech-driven areas like Electronic City. With affordability, convenience, and a strong sense of community, coliving provides the perfect housing solution for millennials looking to balance work and lifestyle. Whether you're a young professional, a freelancer, or someone seeking flexibility, coliving offers a refreshing take on urban living.
                    </p>
                </BlogSection>

                {/* Section 10 */}
                <li className='pb-8'>
                    <p className='leading-relaxed'>
                        If you're considering the{' '}
                        <Link
                            to='/'
                            target='_blank'
                            className='underline font-semibold text-[#125ce2] hover:text-[#eba312] transition-colors duration-300'
                        >
                            Best Coliving Spaces in Bangalore
                        </Link>
                        , explore options that cater to your needs, budget, and lifestyle. Coliving is not just a trend—it's a sustainable and practical solution to modern living that aligns perfectly with millennial values.
                    </p>
                </li>
            </ul>

            {/* Author Info - Bottom */}
            <AuthorInfo
                author={BLOG_DATA.author}
                date={BLOG_DATA.date}
                readTime={BLOG_DATA.readTime}
            />

            <hr className="my-8" />

            {/* Social Share */}
            <SocialShare />
        </div>
    )
}

export default memo(Blog1)