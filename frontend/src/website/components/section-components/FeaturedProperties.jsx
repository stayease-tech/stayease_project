import { useState, useCallback, useMemo, memo } from "react"
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

// Constants - moved outside component
const SLIDER_SPEED = 500
const AUTOPLAY_SPEED = 3000

// Memoized arrow components - exact same styling
const PrevArrow = memo(({ onClick }) => (
    <div
        className="hidden bg-white text-black hover:bg-amber-500 hover:text-white md:block absolute left-[-50px] top-1/2 transform -translate-y-1/2 p-3 rounded-full z-10 text-xl text-black opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 cursor-pointer"
        onClick={onClick}
    >
        <FaArrowLeft />
    </div>
))

PrevArrow.displayName = 'PrevArrow'

const NextArrow = memo(({ onClick }) => (
    <div
        className="hidden bg-white text-black hover:bg-amber-500 hover:text-white md:block absolute right-[-50px] top-1/2 transform -translate-y-1/2 p-3 rounded-full z-10 text-xl text-black opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 cursor-pointer"
        onClick={onClick}
    >
        <FaArrowRight />
    </div>
))

NextArrow.displayName = 'NextArrow'

// Memoized property card component - exact same styling
const PropertyCard = memo(({ property, index }) => (
    <div className="px-3 md:px-5">
        <div className="relative">
            <div className='overflow-hidden rounded-lg'>
                <div className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300'>
                    <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-[40vh] object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                    />
                    <Link
                        to={property.link}
                        className='absolute top-8 right-5 bg-[#eba312] text-white px-3 py-1 text-sm'
                        type='button'
                    >
                        BOOK NOW
                    </Link>
                </div>
            </div>

            <div className="text-center mt-3 px-5 py-3 border border-white rounded-lg">
                <p className='font-semibold text-[#eba312]'>{property.name}</p>
                <p className='mt-1 text-sm'>{property.location}</p>
                <p className='text-sm'>Price Per Month: ₹{property.price}</p>
            </div>
        </div>
    </div>
))

PropertyCard.displayName = 'PropertyCard'

// Memoized grid property card - exact same styling for grid view
const GridPropertyCard = memo(({ property, index }) => (
    <div className="relative mb-5">
        <div className='overflow-hidden rounded-lg'>
            <div className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300'>
                <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-[40vh] object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                />
                <Link
                    to={property.link}
                    className='absolute top-8 right-5 bg-[#eba312] text-white px-3 py-1 text-sm'
                    type='button'
                >
                    BOOK NOW
                </Link>
            </div>
        </div>

        <div className="text-center mt-3 px-5 py-3 border border-white rounded-lg">
            <p className='font-semibold text-[#eba312]'>{property.name}</p>
            <p className='mt-1 text-sm'>{property.location}</p>
            <p className='text-sm'>Price Per Month: ₹{property.price}</p>
        </div>
    </div>
))

GridPropertyCard.displayName = 'GridPropertyCard'

const FeaturedProperties = memo(({ marginTop, heading, properties }) => {
    const [activeSlide, setActiveSlide] = useState(0)
    const [slidesToScroll, setSlidesToScroll] = useState(3)

    // Memoized handlers
    const handleAfterChange = useCallback((current) => {
        setActiveSlide(current)
    }, [])

    const handleBeforeChange = useCallback((slidesToScroll) => {
        setSlidesToScroll(slidesToScroll)
    }, [])

    // Memoized settings
    const settings = useMemo(() => ({
        dots: true,
        customPaging: i => (
            <div className={`mt-3 w-2 h-2 rounded-full transition-all duration-300 ${i === Math.floor(activeSlide / slidesToScroll) ? "bg-[#eba312]" : "bg-white"}`} />
        ),
        afterChange: handleAfterChange,
        infinite: true,
        speed: SLIDER_SPEED,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: AUTOPLAY_SPEED,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    beforeChange: () => handleBeforeChange(2)
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    beforeChange: () => handleBeforeChange(1)
                },
            },
        ],
    }), [activeSlide, slidesToScroll, handleAfterChange, handleBeforeChange])

    // Memoized container class
    const containerClass = useMemo(() =>
        `${(marginTop || heading) ? marginTop : 'mt-[5rem]'} md:mt-0 ${heading ? 'mb-14' : 'md:py-5 lg:py-14'} px-3 md:px-[4rem] lg:px-24`,
        [marginTop, heading]
    )

    return (
        <div className={containerClass}>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">FEATURED PROPERTIES</h1>
            </div>

            {/* Slider View */}
            <div className={`${marginTop ? 'hidden' : 'slider-container'}`}>
                <Slider {...settings} className="relative group">
                    {properties.map((property, index) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            index={index}
                        />
                    ))}
                </Slider>
            </div>

            {/* Grid View */}
            <div className={`${marginTop ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-3 md:px-5' : 'hidden'}`}>
                {properties.map((property, index) => (
                    <GridPropertyCard
                        key={property.id}
                        property={property}
                        index={index}
                    />
                ))}
            </div>
        </div>
    )
})

FeaturedProperties.displayName = 'FeaturedProperties'

export default FeaturedProperties