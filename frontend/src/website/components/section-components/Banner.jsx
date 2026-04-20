import { useEffect, useState, useCallback, memo } from "react"
import { Link } from 'react-router-dom'

const IMAGE_TRANSITION_INTERVAL = 5000
const IMAGES = [
    "static/img/banner/banner_img1.webp",
    "static/img/banner/banner_img2.webp"
]

// Separate component for better loading control
const BackgroundImages = memo(({ currentIndex }) => {
    const [imagesLoaded, setImagesLoaded] = useState({ 0: false, 1: false })
    
    const handleImageLoad = useCallback((index) => {
        setImagesLoaded(prev => ({ ...prev, [index]: true }))
    }, [])

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900"> {/* Fallback background */}
            {IMAGES.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt=""
                    className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                        index === currentIndex ? "opacity-60" : "opacity-0"
                    }`}
                    // FIX: Load both eagerly but with different priorities
                    loading="eager"
                    decoding="async"
                    // FIX: Set high priority ONLY for current image
                    fetchpriority={index === currentIndex ? "high" : "low"}
                    width="1920"
                    height="1080"
                    aria-hidden="true"
                    onLoad={() => handleImageLoad(index)}
                    // Add blur-up effect while loading
                    style={{
                        filter: imagesLoaded[index] ? 'none' : 'blur(10px)',
                        transition: 'filter 0.3s ease-in-out'
                    }}
                />
            ))}
        </div>
    )
})

BackgroundImages.displayName = 'BackgroundImages'

const EnquiryButton = memo(({ onClick }) => (
    <button className="relative group py-5 px-8 bg-[#eba312] text-white transition-all duration-500 ease-in-out">
        <Link
            to="#"
            onClick={onClick}
            className="relative z-10 text-white text-center p-4 transition-all duration-500 ease-in-out group-hover:text-black"
        >
            Make An Enquiry
        </Link>
        <div className="absolute inset-0 bg-white transform scale-x-0 origin-right transition-transform duration-500 ease-in-out group-hover:scale-x-100 z-0"></div>
    </button>
))

EnquiryButton.displayName = 'EnquiryButton'

const Banner = memo(({ scrollToEnquiry }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const nextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % IMAGES.length)
    }, [])

    useEffect(() => {
        const interval = setInterval(nextImage, IMAGE_TRANSITION_INTERVAL)
        return () => clearInterval(interval)
    }, [nextImage])

    const handleEnquiryClick = useCallback((e) => {
        if (scrollToEnquiry) {
            e.preventDefault()
            scrollToEnquiry()
        }
    }, [scrollToEnquiry])

    return (
        <section className="relative h-[65vh] sm:h-[85vh] md:h-[100vh] mb-[3rem] md:mb-[3rem]">
            {/* Background Images */}
            <BackgroundImages currentIndex={currentImageIndex} />

            {/* Content Overlay - Show immediately even if images are loading */}
            <div className={`absolute top-[65%] md:top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 transition-opacity duration-500 opacity-100`}>
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold animate-slide-up whitespace-nowrap">
                    EXPERIENCE CO-LIVING LIKE NEVER BEFORE!
                </h1>

                <div className='mt-8 xl:whitespace-nowrap animate-slide-up'>
                    <p className="md:text-xl">
                        Experience a new way of living with a vibrant community and all-inclusive amenities designed for modern lifestyles.
                    </p>
                </div>

                <div className="mt-8 animate-slide-up">
                    <EnquiryButton onClick={handleEnquiryClick} />
                </div>
            </div>
        </section>
    )
})

Banner.displayName = 'Banner'

export default Banner