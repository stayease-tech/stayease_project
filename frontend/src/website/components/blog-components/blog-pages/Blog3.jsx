import { Link } from 'react-router-dom'
import { memo } from 'react'

// Constants
const BLOG_DATA = {
    title: "Pet-Friendly Coliving Spaces: A Haven for You and Your Furry Friend",
    author: "Uma Ghosh",
    date: "Feb 11, 2025",
    readTime: "3 min read",
    mainImage: "static/img/blog/blog_img4.webp",
    mainImageAlt: "Pet-friendly coliving space - Happy dog with owner in modern shared accommodation"
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

// Memoized blog paragraph component
const BlogParagraph = memo(({ children, isFirst = false }) => (
    <li className='pb-8'>
        <p className={`text-gray-700 leading-relaxed ${isFirst ? '' : ''}`}>
            {children}
        </p>
    </li>
))

BlogParagraph.displayName = 'BlogParagraph'

function Blog3() {
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

            {/* First Section */}
            <ul className='space-y-6'>
                <BlogParagraph isFirst>
                    Moving to a new place may be both thrilling and intimidating, particularly if you have
                    a pet. It can be difficult to find accommodation that accepts your pet because many
                    traditional PGs and rental flats have stringent no-pet regulations. Pet-friendly coliving
                    facilities in Bangalore, on the other hand, are revolutionizing the industry by
                    providing a comfortable and hassle-free environment for both owners and their
                    animals.
                </BlogParagraph>

                <BlogParagraph>
                    Coliving facilities acknowledge the relationship between pet parents and their
                    animals, in contrast to traditional rentals that have tight rules. Your pet will feel as at
                    home in these well-thought-out places as you do thanks to open rooms, pet-friendly
                    furnishings, and even designated play areas. Coliving creates an atmosphere where
                    you and your pet can develop deep relationships with a lively group of other pet
                    owners. Socialization is made easy by the fact that many of these places even host
                    pet activities and get-togethers.
                </BlogParagraph>
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

            {/* Remaining Content */}
            <ul className='space-y-6 pb-10'>
                <BlogParagraph>
                    Avoiding the usual landlord annoyances is one of the main benefits of selecting a
                    pet-friendly coliving property. Paying large deposits, deciphering murky rules, and
                    putting up with recalcitrant landlords or irate neighbors are all common challenges
                    when renting an apartment with a pet. Coliving facilities reduce this stress by
                    providing transparent pet policies that guarantee a simple and easy move-in
                    procedure.
                </BlogParagraph>

                <BlogParagraph>
                    Many coliving locations go above and beyond by offering easy pet care services in
                    addition to lodging. These services, which range from pet sitting and grooming to
                    veterinarian tie-ups, simplify life, particularly for working professionals. You can
                    relax knowing that your pet is well-cared after without having to make last-minute
                    preparations, regardless of your hectic work schedule or unforeseen travel plans.
                </BlogParagraph>

                <BlogParagraph>
                    Another significant benefit of coliving is the living atmosphere. Coliving provides well-
                    ventilated areas, pet-friendly areas, and convenient access to local parks, in contrast
                    to compact rental apartments or claustrophobic PGs. Pets have plenty of space to
                    roam, play, and interact with their environment, all of which improve their general
                    wellbeing.
                </BlogParagraph>

                <BlogParagraph>
                    It might be stressful for you and your pet to live in a house that does not allow pets.
                    Coliving facilities eliminate that fear by providing a welcoming, pet-friendly
                    environment free from ongoing limitations and criticism. You can live a stress-free life
                    with your pet at your side if your neighbors share your interests and the management
                    is supportive.
                </BlogParagraph>

                <BlogParagraph>
                    For pet owners looking for a pleasant, worry-free, and community-driven lifestyle,
                    Bangalore's pet-friendly coliving spaces provide the perfect answer. With easy
                    access to essential pet care services, a warm and inclusive environment, and a
                    space designed for both human and animal companionship, coliving presents a
                    refreshing alternative to traditional rentals. A pet-friendly coliving space can be the
                    ideal option if you and your pet are looking for a place that genuinely understands
                    your needs.
                </BlogParagraph>
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

export default memo(Blog3)