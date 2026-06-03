import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'

// Constants defined outside component
const SLIDE_INTERVAL = 3000
const TOUCH_THRESHOLD = 50
const OBSERVER_THRESHOLD = 0.5

// Static slide data
const SLIDES = [
    { src: "static/img/accomodations/accomodation_img1.webp", alt: 'Single_Private', text: 'Single Private' },
    { src: "static/img/accomodations/accomodation_img2.webp", alt: 'Private_With_Balcony', text: 'Private With Balcony' },
    { src: "static/img/accomodations/accomodation_img3.webp", alt: 'Double_Sharing', text: 'Double Sharing' },
    { src: "static/img/accomodations/accomodation_img4.webp", alt: 'Triple_Sharing', text: 'Triple Sharing' }
]

// Memoized dot indicators
const DotIndicators = memo(({ total, current, onDotClick }) => (
    <div className="flex justify-center mt-8">
        {Array.from({ length: total }).map((_, index) => (
            <span
                key={index}
                className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full transition-colors duration-300 ${current === index + 1 ? 'bg-amber-500' : 'bg-gray-300 hover:bg-amber-300'
                    }`}
                onClick={() => onDotClick(index + 1)}
                aria-label={`Go to slide ${index + 1}`}
                role="button"
                tabIndex={0}
            />
        ))}
    </div>
))

DotIndicators.displayName = 'DotIndicators'

// Memoized slide component
const Slide = memo(({ slide, index, isActive }) => (
    <div
        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'
            }`}
        aria-hidden={!isActive}
    >
        <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"} // First slide eager, others lazy
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
        />

        <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
            {index + 1} / {SLIDES.length}
        </div>

        <div className="bg-[#282b38] rounded-md absolute top-[85%] md:top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white py-2 px-10 text-base opacity-80 transition-opacity duration-300 text-center text-sm">
            {slide.text}
        </div>
    </div>
))

Slide.displayName = 'Slide'

const Accomodations = memo(() => {
    const [slideIndex, setSlideIndex] = useState(1)
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)

    // Use refs for touch tracking to avoid re-renders
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    // Memoized navigation functions
    const plusSlides = useCallback((n) => {
        setSlideIndex((prev) => ((prev - 1 + n + SLIDES.length) % SLIDES.length) + 1)
    }, [])

    const currentSlide = useCallback((index) => {
        setSlideIndex(index)
    }, [])

    // Touch handlers with useCallback
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.targetTouches[0].clientX
    }, [])

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.targetTouches[0].clientX
    }, [])

    const handleTouchEnd = useCallback(() => {
        const diff = touchStartX.current - touchEndX.current
        if (Math.abs(diff) > TOUCH_THRESHOLD) {
            plusSlides(diff > 0 ? 1 : -1)
        }
        // Reset touch values
        touchStartX.current = 0
        touchEndX.current = 0
    }, [plusSlides])

    // Auto-play interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            plusSlides(1)
        }, SLIDE_INTERVAL)

        return () => clearInterval(intervalId)
    }, [plusSlides])

    // Intersection Observer for text animation
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

        const currentRef = sectionRef.current
        if (currentRef) observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [])

    // Memoized slides mapping
    const slidesList = useMemo(() =>
        SLIDES.map((slide, index) => (
            <Slide
                key={index}
                slide={slide}
                index={index}
                isActive={slideIndex === index + 1}
            />
        )),
        [slideIndex]
    )

    return (
        <section className='px-3 md:px-10 lg:px-24 pt-[5rem] lg:pt-[3rem] pb-[2rem] md:pb-[4rem] lg:pb-[5rem]'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">OUR ACCOMODATIONS</h1>
            </div>

            {/* Slider Container */}
            <div
                className="relative w-full overflow-hidden group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="relative w-full h-[50vh] md:h-[75vh]">
                    {slidesList}
                </div>

                {/* Navigation Buttons - Desktop Only */}
                <button
                    className="prev absolute top-[50%] left-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300 hover:text-[#eba312] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onClick={() => plusSlides(-1)}
                    aria-label="Previous slide"
                >
                    ❮
                </button>
                <button
                    className="next absolute top-[50%] right-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300 hover:text-[#eba312] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onClick={() => plusSlides(1)}
                    aria-label="Next slide"
                >
                    ❯
                </button>
            </div>

            {/* Dot Indicators */}
            <DotIndicators
                total={SLIDES.length}
                current={slideIndex}
                onDotClick={currentSlide}
            />

            {/* Animated Text Section */}
            <div
                ref={sectionRef}
                className={`${isVisible ? 'animate-slide-up' : 'opacity-0'
                    } transition-all mt-10 md:ps-8 xl:pe-[30rem] md:border-l-2 border-[#eba312] w-full max-w-max`}
            >
                <p>
                    We understand that everyone has different needs when it comes to living space.
                    That's why we offer a variety of accommodation options to suit your style and budget.
                    No matter which option you choose, you'll benefit from all the advantages of the
                    Stayease living experience.
                </p>
            </div>
        </section>
    )
})

Accomodations.displayName = 'Accomodations'

export default Accomodations