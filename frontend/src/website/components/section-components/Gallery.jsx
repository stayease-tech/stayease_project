import { useState, useEffect, useRef, useCallback, memo } from 'react'

// Constants
const SLIDE_INTERVAL = 3000
const OBSERVER_THRESHOLD = 0.5

// Static image data - defined outside component
const IMAGE_SETS = [
    [
        'static/img/gallery/common_area_img1.webp',
        'static/img/gallery/common_area_img2.webp',
        'static/img/gallery/common_area_img3.webp',
        'static/img/gallery/common_area_img4.webp',
    ],
    [
        'static/img/gallery/living_room_img1.webp',
        'static/img/gallery/living_room_img2.webp',
        'static/img/gallery/living_room_img3.webp',
        'static/img/gallery/living_room_img4.webp',
    ],
    [
        'static/img/gallery/kitchen_area_img1.webp',
        'static/img/gallery/kitchen_area_img2.webp',
        'static/img/gallery/kitchen_area_img3.webp',
        'static/img/gallery/kitchen_area_img4.webp',
    ],
    [
        'static/img/gallery/bedroom_img1.webp',
        'static/img/gallery/bedroom_img2.webp',
        'static/img/gallery/bedroom_img3.webp',
        'static/img/gallery/bedroom_img4.webp',
    ],
]

const DESCRIPTIONS = ['Common Area', 'Living Room', 'Kitchen Area', 'Bedroom']

// Memoized description text component
const DescriptionText = memo(({ currentIndex }) => (
    <div className="relative text-white pb-[3rem]">
        {DESCRIPTIONS.map((description, index) => (
            <p
                key={index}
                className={`absolute text-xl transition-opacity duration-1000 ${currentIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                aria-hidden={currentIndex !== index}
            >
                {description}
            </p>
        ))}
    </div>
))

DescriptionText.displayName = 'DescriptionText'

// Memoized image grid component
const ImageGrid = memo(({ imageSet, isActive }) => (
    <div
        className={`absolute grid grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'
            }`}
        aria-hidden={!isActive}
    >
        {imageSet.map((image, index) => (
            <div
                key={index}
                className="relative w-full h-[20vh] md:h-[40vh] lg:h-[40vh] xl:h-[45vh] overflow-hidden group"
            >
                <img
                    src={image}
                    alt={`${DESCRIPTIONS[imageSet]} view ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={index < 2 ? 'eager' : 'lazy'} // First 2 images eager, rest lazy
                    decoding="async"
                />
            </div>
        ))}
    </div>
))

ImageGrid.displayName = 'ImageGrid'

// Memoized navigation buttons
const NavButton = memo(({ direction, onClick }) => (
    <button
        onClick={onClick}
        className={`absolute top-[50%] ${direction === 'prev' ? 'left-[-3%]' : 'right-[-3%]'} transform -translate-y-1/2 text-white text-4xl opacity-0 group-hover:opacity-90 transition-opacity duration-300 hidden md:block hover:text-[#eba312] focus:outline-none focus:ring-2 focus:ring-amber-500`}
        aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} slide`}
    >
        {direction === 'prev' ? '❮' : '❯'}
    </button>
))

NavButton.displayName = 'NavButton'

// Memoized dot indicators
const DotIndicators = memo(({ total, current, onDotClick }) => (
    <div className="flex justify-center my-8 md:hidden">
        {Array.from({ length: total }).map((_, index) => (
            <span
                key={index}
                className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full transition-colors duration-300 ${current === index ? 'bg-amber-500' : 'bg-gray-300 hover:bg-amber-300'
                    }`}
                onClick={() => onDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                role="button"
                tabIndex={0}
            />
        ))}
    </div>
))

DotIndicators.displayName = 'DotIndicators'

const Gallery = memo(() => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const textRef = useRef(null)

    // Memoized navigation functions
    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % IMAGE_SETS.length)
    }, [])

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? IMAGE_SETS.length - 1 : prev - 1))
    }, [])

    const handleDotClick = useCallback((index) => {
        setCurrentIndex(index)
    }, [])

    // Auto-play interval
    useEffect(() => {
        const interval = setInterval(handleNext, SLIDE_INTERVAL)
        return () => clearInterval(interval)
    }, [handleNext])

    // Intersection observer for text animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            { threshold: OBSERVER_THRESHOLD }
        )

        const currentRef = textRef.current
        if (currentRef) observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [])

    return (
        <section className='px-3 md:px-10 lg:px-24 pt-[1rem] md:pt-[3rem] lg:pt-[3rem] pb-[2rem] md:pb-[4rem] lg:pb-[5rem]'>
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">OUR GALLERY</h1>
            </div>

            {/* Description Text */}
            <DescriptionText currentIndex={currentIndex} />

            {/* Image Slider */}
            <div className="relative flex flex-col justify-center group">
                <div className="h-[40vh] md:h-[80vh] lg:h-[45vh] xl:h-[50vh] w-[100%] relative">
                    {IMAGE_SETS.map((imageSet, rowIndex) => (
                        <ImageGrid
                            key={rowIndex}
                            imageSet={imageSet}
                            isActive={currentIndex === rowIndex}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <NavButton direction="prev" onClick={handlePrev} />
                <NavButton direction="next" onClick={handleNext} />
            </div>

            {/* Mobile Dot Indicators */}
            <DotIndicators
                total={DESCRIPTIONS.length}
                current={currentIndex}
                onDotClick={handleDotClick}
            />

            {/* Animated Text Section */}
            <div
                ref={textRef}
                className={`${isVisible ? 'animate-slide-up' : 'opacity-0'
                    } transition-all mt-[2rem] md:mt-[3rem] lg:mt-0 md:ps-8 xl:pe-[30rem] md:border-l-2 border-[#eba312] w-full max-w-max`}
            >
                <p>
                    Peek into the world of Stayease through our gallery! We invite you to envision
                    yourself living in complete comfort, connection, and convenience. Here, you'll
                    discover the spaces that make up our unique co-living experience.
                </p>
            </div>
        </section>
    )
})

Gallery.displayName = 'Gallery'

export default Gallery