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

// Lightbox overlay component
const Lightbox = memo(({ images, index, onClose, onPrev, onNext }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onPrev()
            if (e.key === 'ArrowRight') onNext()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [onClose, onPrev, onNext])

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-amber-400 transition-colors focus:outline-none"
                aria-label="Close lightbox"
            >
                ✕
            </button>

            {/* Prev arrow */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev() }}
                className="absolute left-4 text-white text-5xl hover:text-amber-400 transition-colors focus:outline-none select-none"
                aria-label="Previous image"
            >
                ❮
            </button>

            {/* Image */}
            <img
                src={images[index]}
                alt={`Gallery image ${index + 1}`}
                className="max-h-[85vh] max-w-[85vw] object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Next arrow */}
            <button
                onClick={(e) => { e.stopPropagation(); onNext() }}
                className="absolute right-4 text-white text-5xl hover:text-amber-400 transition-colors focus:outline-none select-none"
                aria-label="Next image"
            >
                ❯
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 text-white text-sm opacity-70">
                {index + 1} / {images.length}
            </div>
        </div>
    )
})

Lightbox.displayName = 'Lightbox'

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
const ImageGrid = memo(({ imageSet, isActive, onImageClick }) => (
    <div
        className={`absolute grid grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'
            }`}
        aria-hidden={!isActive}
    >
        {imageSet.map((image, index) => (
            <div
                key={index}
                className="relative w-full h-[20vh] md:h-[40vh] lg:h-[40vh] xl:h-[45vh] overflow-hidden group cursor-pointer"
                onClick={() => isActive && onImageClick(image)}
            >
                <img
                    src={image}
                    alt={`Gallery view ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white text-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-300">⊕</span>
                </div>
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
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 })
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

    const openLightbox = useCallback((image) => {
        const allImages = IMAGE_SETS[currentIndex]
        const idx = allImages.indexOf(image)
        setLightbox({ open: true, images: allImages, index: idx >= 0 ? idx : 0 })
    }, [currentIndex])

    const closeLightbox = useCallback(() => {
        setLightbox(prev => ({ ...prev, open: false }))
    }, [])

    const lightboxPrev = useCallback(() => {
        setLightbox(prev => ({
            ...prev,
            index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1
        }))
    }, [])

    const lightboxNext = useCallback(() => {
        setLightbox(prev => ({
            ...prev,
            index: (prev.index + 1) % prev.images.length
        }))
    }, [])

    // Auto-play interval — pause when lightbox is open
    useEffect(() => {
        if (lightbox.open) return
        const interval = setInterval(handleNext, SLIDE_INTERVAL)
        return () => clearInterval(interval)
    }, [handleNext, lightbox.open])

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
            {/* Lightbox */}
            {lightbox.open && (
                <Lightbox
                    images={lightbox.images}
                    index={lightbox.index}
                    onClose={closeLightbox}
                    onPrev={lightboxPrev}
                    onNext={lightboxNext}
                />
            )}

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
                            onImageClick={openLightbox}
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
