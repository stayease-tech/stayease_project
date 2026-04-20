import { memo } from 'react'
import { Link } from 'react-router-dom'

// Static blog data - defined outside component to prevent recreation
const BLOG_POSTS = [
    {
        id: 1,
        to: '/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore',
        image: "static/img/blog/blog_img2.webp",
        date: "Sep 8, 2024",
        title: "Top Benefits of Co-Living or Sharing Accommodation for Millennials in Bangalore",
        alt: "Co-living benefits for millennials"
    },
    {
        id: 2,
        to: '/red-flags-to-watch-out-for-before-shifting-to-a-coliving-space-in-bangalore',
        image: "static/img/blog/blog_img3.webp",
        date: "Feb 11, 2025",
        title: "Red Flags to Watch Out for Before Shifting to a Co-Living Space in Bangalore",
        alt: "Co-living red flags"
    },
    {
        id: 3,
        to: '/pet-friendly-coliving-spaces',
        image: "static/img/blog/blog_img4.webp",
        date: "Feb 11, 2025",
        title: "Pet-Friendly Coliving Spaces: A Haven for You and Your Furry Friend",
        alt: "Pet-friendly coliving"
    },
    {
        id: 4,
        to: '/coliving-vs-pgs-and-rented-flats',
        image: "static/img/blog/blog_img5.webp",
        date: "Feb 11, 2025",
        title: "Women-Friendly Coliving Spaces: A Safe Haven for Independent Living",
        alt: "Women-friendly coliving"
    },
    {
        id: 5,
        to: '/women-friendly-coliving-spaces',
        image: "static/img/blog/blog_img6.webp",
        date: "Feb 22, 2025",
        title: "Coliving vs PGs & Rented Flats: The Smarter Choice for Young Professionals",
        alt: "Coliving comparison"
    },
    {
        id: 6,
        to: '/rent-right-or-regret-later',
        image: "static/img/blog/blog_img7.webp",
        date: "Feb 22, 2025",
        title: "Rent Right or Regret Later: Why a Rental Agreement is a Must-Have!",
        alt: "Rental agreement importance"
    },
    {
        id: 7,
        to: '/new-city-new-digs',
        image: "static/img/blog/blog_img8.webp",
        date: "Feb 22, 2025",
        title: "New City, New Digs? Your Rental Agreement Can Unlock EMIs!",
        alt: "Rental agreement EMIs"
    },
    {
        id: 8,
        to: '/roomies-real-life-growth',
        image: "static/img/blog/blog_img9.webp",
        date: "Mar 11, 2025",
        title: "Roomies, Real Life & Growth: How Shared Living Shapes Student Life",
        alt: "Student shared living benefits"
    }
]

// Memoized blog card component
const BlogCard = memo(({ post, index }) => (
    <Link
        className="group"
        to={post.to}
        aria-label={`Read article: ${post.title}`}
    >
        <img
            src={post.image}
            alt={post.alt}
            className="w-full h-[35vh] mt-5 object-cover rounded-sm group-hover:opacity-90 transition-opacity duration-300"
            loading={index < 4 ? "eager" : "lazy"} // First 4 images eager, rest lazy
            decoding="async"
            fetchpriority={index < 2 ? "high" : "auto"} // First 2 images high priority
        />
        <div className='mb-10 px-1 pt-3'>
            <p className='text-xs mb-3 text-gray-500'>{post.date}</p>
            <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition-colors duration-300 line-clamp-3'>
                {post.title}
            </h3>
        </div>
    </Link>
))

BlogCard.displayName = 'BlogCard'

const BlogDetails = memo(() => {
    return (
        <div className="pt-[3rem] md:pt-[4.5rem] pb-[1rem] md:pb-[2rem]">
            {/* Header */}
            <div className='text-center mb-5'>
                <h1 className="text-2xl md:text-3xl font-semibold my-3 md:my-5 text-[#eba312]">
                    TOP READS
                </h1>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:gap-5 px-3 md:px-5 lg:px-8">
                {BLOG_POSTS.map((post, index) => (
                    <BlogCard
                        key={post.id}
                        post={post}
                        index={index}
                    />
                ))}
            </div>
        </div>
    )
})

BlogDetails.displayName = 'BlogDetails'

export default BlogDetails