import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Roomies, Real Life & Growth: How Shared Living Shapes Student Life",
    author: "Uma Ghosh",
    date: "Mar 11, 2025",
    readTime: "3 min read",
    mainImage: "static/img/blog/blog_img9.webp",
    mainImageAlt: "Students sharing living space - Roommates building community and life skills"
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

// Memoized conclusion section
const ConclusionSection = memo(({ title, children }) => (
    <li className='pb-8'>
        <h3 className='text-lg md:text-xl font-semibold text-gray-800 mb-2'>{title}</h3>
        <p className='text-gray-700 leading-relaxed'>
            {children}
        </p>
    </li>
))

ConclusionSection.displayName = 'ConclusionSection'

function Blog8() {
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
                    A student's personality, morals, and future are shaped by the experiences they have along the way. Living in communal housing is one of these experiences that is crucial to students' overall growth. Whether living in a hostel, rented flat with roommates, or a college dorm, shared living imparts priceless life lessons that extend beyond the classroom. Let's examine how shared housing affects a student's overall development, from fostering a sense of community to promoting financial independence.
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

            {/* Content Sections - 10 Numbered Sections */}
            <ul className='space-y-6 pb-6'>
                {/* Section 1 */}
                <NumberedSection title="1. Community Building: The Foundation of Lifelong Bonds">
                    Living with roommates fosters a tight-knit community where students make lifelong
                    friendships. Participating in a group promotes the value of cooperation, respect, and
                    comprehension of diverse viewpoints. Students who live together are more likely to talk,
                    enjoy holidays, and help one another out when things become tough. Particularly for people living away from their family for the first time, the sense of belonging that results from shared living promotes emotional well-being by lowering emotions of loneliness and homesickness.
                </NumberedSection>

                {/* Section 2 */}
                <NumberedSection title="2. Networking: Expanding Horizons">
                    The chance to network with a variety of people is one of the main benefits of shared
                    housing. Students bring distinct viewpoints and ideas from a variety of academic areas,
                    cultures, and backgrounds. These exchanges improve learning outside of the classroom and
                    can result in beneficial academic partnerships, internships, and professional growth. Many prosperous professionals credit their development to the relationships they made while living together as students.
                </NumberedSection>

                {/* Section 3 */}
                <NumberedSection title="3. Financially Sound: Learning the Value of Money">
                    Students' financial burden is greatly lessened by shared housing. Because roommates
                    divide costs like rent, utilities, groceries, and other expenses, it's more affordable than living alone. Students also gain budgeting skills, financial management knowledge, and a sense of financial responsibility. They are better prepared for any financial difficulties they may encounter as adults thanks to this early exposure to money management.
                </NumberedSection>

                {/* Section 4 */}
                <NumberedSection title="4. Self-Dependency: A Step Towards Adulthood">
                    Self-reliance is among the most crucial qualities that students learn when living in shared housing. Students gain problem-solving abilities and emotional resilience via handling everyday tasks and settling disputes. They develop their independence and get ready for life beyond college by learning how to cook, clean, and take care of themselves. Students gain confidence and develop into responsible adults as a result of this self-sufficiency.
                </NumberedSection>

                {/* Section 5 */}
                <NumberedSection title="5. Improved Communication and Social Skills">
                    Effective communication is essential for a harmonious relationship when living with
                    roommates. Students develop the skills of compromise, negotiation, and active listening
                    through topics like setting boundaries and talking about home duties. Both the personal and professional spheres benefit greatly from these communication abilities. A key component of success in every career is the capacity for clear communication and peaceful dispute resolution.
                </NumberedSection>

                {/* Section 6 */}
                <NumberedSection title="6. Enhanced Adaptability and Tolerance">
                    Students living in shared housing frequently have to adapt to new customs, habits, and ways of life. They become more flexible and tolerant as a result of this exposure. Patience and understanding are fostered by learning to live with people who may have different viewpoints and lifestyles. Students gain more flexibility and tolerance as a result of these experiences, preparing them for future employment in a variety of settings.
                </NumberedSection>

                {/* Section 7 */}
                <NumberedSection title="7. Shared Responsibilities: The Art of Teamwork">
                    It takes teamwork to keep up a shared living area. Students gain an understanding of the
                    value of teamwork through tasks including house rules, household budgeting, and cleaning
                    the common spaces. These encounters foster a sense of accountability and responsibility,
                    two traits that are essential for both professional and personal development.
                </NumberedSection>

                {/* Section 8 */}
                <NumberedSection title="8. Better Academic Performance and Peer Learning">
                    Being accompanied by other students fosters a positive learning atmosphere. Discussions,
                    study groups, and information exchange become commonplace. Students can share study
                    materials, encourage one another during tests, and assist one another in understanding difficult subjects. Peer learning improves academic achievement and fosters a collaborative environment.
                </NumberedSection>

                {/* Section 9 */}
                <NumberedSection title="9. Emotional Growth and Mental Resilience">
                    Emotional development is facilitated by living away from home and dealing with day-to-day
                    difficulties in a shared housing environment. Students gain skills in managing stress,
                    resolving disputes, and getting over homesickness. They receive emotional support from
                    their housemates, which strengthens their mental fortitude and prepares them to face
                    obstacles in the real world.
                </NumberedSection>

                {/* Section 10 */}
                <NumberedSection title="10. Time Management and Discipline">
                    Students living in shared lodgings have to be good time managers without parental
                    supervision. They must strike a balance between their personal obligations, social lives, and academics. A planned routine is crucial for success in both the personal and professional spheres, and this self-discipline aids in its development.
                </NumberedSection>

                {/* Conclusion */}
                <ConclusionSection title="It's a wrap!">
                    Beyond simply having a place to stay, living in shared housing is a fulfilling experience. By encouraging community building, networking, financial responsibility, self-reliance, and adaptability, it promotes personal, social, and professional growth. Even though difficulties could occur, the knowledge gained throughout this stage equips students for the intricacies of adulthood. In addition to sharing a place, shared housing fosters experience sharing, life skills development, and the development of well-rounded people.
                </ConclusionSection>
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

export default memo(Blog8)