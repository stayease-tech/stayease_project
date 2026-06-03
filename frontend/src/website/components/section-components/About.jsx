import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'

// Constants defined outside component
const OBSERVER_THRESHOLD = 0.5
const ANIMATION_CLASS = "animate-on-scroll"

// Static image paths
const ABOUT_IMAGE = "static/img/about-us/aboutUs_img.webp"
const COMMUNITY_IMAGES = {
    col1: [
        "static/img/community/community_img1.webp",
        "static/img/community/community_img4.webp",
        "static/img/community/community_img2.webp"
    ],
    col2: [
        "static/img/community/community_img3.webp",
        "static/img/community/community_img6.webp"
    ]
}

// Memoized section component for reusability
const AnimatedSection = memo(({ id, children, visibleElements, className = "" }) => {
    const isVisible = visibleElements[id]

    return (
        <div
            data-id={id}
            className={`${ANIMATION_CLASS} transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${className}`}
        >
            {children}
        </div>
    )
})

AnimatedSection.displayName = 'AnimatedSection'

// Memoized vision/mission/value cards
const InfoCard = memo(({ title, subtitle, children }) => (
    <div className="lg:mx-20 my-10">
        <h1 className="text-xl md:text-2xl font-semibold my-5 text-[#eba312]">
            {title} {subtitle && <i className='semibold'>{subtitle}</i>}
        </h1>
        {children}
    </div>
))

InfoCard.displayName = 'InfoCard'

const About = memo(({ property }) => {
    const [visibleElements, setVisibleElements] = useState({})

    // Optimized observer callback with useCallback
    const handleIntersection = useCallback((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setVisibleElements((prev) => ({
                    ...prev,
                    [entry.target.dataset.id]: true,
                }))
                // Unobserve after animation triggered
                entry.target.classList.remove(ANIMATION_CLASS)
            }
        })
    }, [])

    // Intersection Observer setup
    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            threshold: OBSERVER_THRESHOLD
        })

        const elements = document.querySelectorAll(`.${ANIMATION_CLASS}`)
        elements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [handleIntersection, property]) // Re-run when property changes (new elements)

    // Memoized conditional classes
    const sectionClass = useMemo(() =>
        property
            ? 'm-5 sm:m-10 lg:m-24 min-h-screen'
            : 'mx-5 md:mx-10 lg:mx-24 md:mt-[5rem] lg:mt-24 lg:mb-10',
        [property]
    )

    // Memoized community image grid
    const communityImages = useMemo(() => (
        <div className="flex px-1 lg:w-[50vw] lg:h-[70vh]">
            <div className="w-1/2 px-1 sm:w-1/2 xs:w-full">
                {COMMUNITY_IMAGES.col1.map((src, index) => (
                    <img
                        key={`col1-${index}`}
                        src={src}
                        alt={`Community ${index + 1}`}
                        className='w-full m-1'
                        loading="lazy"
                        decoding="async"
                    />
                ))}
            </div>
            <div className="w-1/2 px-1 sm:w-1/2 xs:w-full">
                {COMMUNITY_IMAGES.col2.map((src, index) => (
                    <img
                        key={`col2-${index}`}
                        src={src}
                        alt={`Community ${index + 4}`}
                        className='w-full m-1'
                        loading="lazy"
                        decoding="async"
                    />
                ))}
            </div>
        </div>
    ), [])

    return (
        <section className={sectionClass}>
            {/* Hero Section */}
            <div className='flex flex-col lg:flex-row lg:space-x-20'>
                {/* Desktop Image */}
                <div className='md:h-[70vh] hidden lg:block'>
                    <img
                        src={ABOUT_IMAGE}
                        alt="About StayEase"
                        className='w-[100%] h-[70] md:h-[70vh] lg:w-[45vw] object-cover'
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                    />
                </div>

                {/* Hero Content */}
                <div className="flex items-center lg:w-[44vw] md:h-[38vh] lg:h-[70vh]">
                    <AnimatedSection id="section1" visibleElements={visibleElements}>
                        <div className="md:mb-10 text-center">
                            <h1 className="text-2xl md:text-3xl font-semibold my-3 md:my-5 text-[#eba312]">
                                ABOUT STAYEASE
                            </h1>
                        </div>

                        <p className='my-5'>
                            At Stayease, We Redefine modern living with <b>premium coliving spaces,
                                luxury PG accommodations, and fully furnished homestays</b> & shortstays in
                            prime locations across Bangalore. Whether you're a working professional,
                            student, or traveler, our spaces blend comfort, style, and Stayease community
                            to create unforgettable living experiences.
                        </p>

                        <div className={`mt-8 ${property ? property : ''}`}>
                            <button className="relative group py-5 px-8 bg-[#eba312] text-white transition-all duration-500 ease-in-out">
                                <Link
                                    to="/about"
                                    className="relative z-10 text-white text-center p-4 transition-all duration-500 ease-in-out group-hover:text-black"
                                >
                                    READ MORE
                                </Link>
                                <div className="absolute inset-0 bg-white transform scale-x-0 origin-right transition-transform duration-500 ease-in-out group-hover:scale-x-100 z-0"></div>
                            </button>
                        </div>
                    </AnimatedSection>
                </div>
            </div>

            {/* Extended Content (only when property prop is true) */}
            {property && (
                <>
                    {/* Vision Section */}
                    <AnimatedSection id="section2" visibleElements={visibleElements}>
                        <InfoCard title="Our Vision - " subtitle="Experience the Luxury within reach">
                            <p className='mt-8'>
                                At Stayease, We Redefine modern living with premium coliving spaces,
                                luxury PG accommodations, and fully furnished homestays & shortstays in
                                prime locations across Bangalore. Whether you're a working professional,
                                student, or traveler, our spaces blend comfort, style, and Stayease
                                community to create unforgettable living experiences.
                            </p>
                        </InfoCard>
                    </AnimatedSection>

                    {/* Mission Section */}
                    <AnimatedSection id="section3" visibleElements={visibleElements}>
                        <InfoCard title="Our Mission - " subtitle="Luxury Lifestyle with Affordable Rates">
                            <p className='mt-8'>
                                Stayease is dedicated to providing premium coliving spaces, luxury PGs,
                                and fully furnished homestays in prime urban locations at very reasonable
                                prices. We deliver hassle-free living experiences by combining modern
                                amenities, friendly communities and unmatched convenience, ensuring every
                                resident enjoys a safe, stylish, and sustainable home kind of ambience.
                            </p>
                        </InfoCard>
                    </AnimatedSection>

                    {/* Values Section */}
                    <AnimatedSection id="section4" visibleElements={visibleElements}>
                        <InfoCard title="Our Values">
                            <p className='mt-8'>
                                At Stayease, we're driven by a set of core values that shape everything
                                we do. We believe in fostering vibrant communities where residents can
                                connect and build lasting relationships, creating a welcoming and inclusive
                                environment for everyone.
                            </p>
                        </InfoCard>
                    </AnimatedSection>

                    {/* Goals Section */}
                    <AnimatedSection id="section5" visibleElements={visibleElements}>
                        <InfoCard title="Our Goals">
                            <p className='mt-8'>
                                Our goals at Stayease are ambitious yet focused. We plan to strategically
                                expand our properties within Bangalore and into other major cities in
                                Karnataka over the next three years.
                            </p>

                            <ul className='list-disc mt-5 pl-10'>
                                <li className='py-3'><b>Expansion:</b> Strategically expand properties within Bangalore and into other major cities in Karnataka within three years.</li>
                                <li className='py-3'><b>Resident Experience:</b> Continuously enhance the resident experience, incorporating feedback and adding amenities, targeting a 95% satisfaction rating.</li>
                                <li className='py-3'><b>Brand Building:</b> Establish Stayease as the leading shared living provider through targeted marketing and brand recognition.</li>
                                <li className='py-3'><b>Operational Efficiency:</b> Streamline operations and implement technology for enhanced booking and resident management while maintaining high service quality.</li>
                                <li className='py-3'><b>Community Building:</b> Foster thriving communities through regular events and active resident engagement.</li>
                                <li className='py-3'><b>Strategic Partnerships:</b> Develop partnerships to offer residents exclusive benefits.</li>
                                <li className='py-3'><b>Sustainability:</b> Implement eco-friendly practices and reduce our environmental footprint by 20% within three years.</li>
                            </ul>
                        </InfoCard>
                    </AnimatedSection>

                    {/* Community Section */}
                    <div className='flex flex-col lg:flex-row lg:space-x-20 lg:m-20'>
                        <div className="flex items-center lg:w-[44vw] md:h-[38vh] lg:h-[70vh]">
                            <AnimatedSection id="section6" visibleElements={visibleElements}>
                                <div className="md:mb-10 text-center">
                                    <h1 className="text-2xl md:text-3xl font-semibold my-3 md:my-5 text-[#eba312]">
                                        About Stayease Community
                                    </h1>
                                </div>

                                <p className='my-5'>
                                    At Stayease, we believe that home is more than just a place to live –
                                    it's a space to connect, grow, and thrive. Our premium coliving and
                                    luxury PG spaces are designed to foster a vibrant, inclusive community
                                    where residents can build lifelong friendships, collaborate on ideas,
                                    and create unforgettable memories.
                                </p>
                            </AnimatedSection>
                        </div>

                        {communityImages}
                    </div>

                    {/* Why Community Stands Out */}
                    <AnimatedSection id="section7" visibleElements={visibleElements}>
                        <InfoCard title="" subtitle="Why Does the StayEase Community Stand Out ?">
                            <ol className='list-decimal mt-5 pl-10'>
                                <li className='py-3'>
                                    <b>A Diverse, Inclusive Network</b> <br />
                                    <i className='ps-5'>From working professionals to students and travelers, our community brings together individuals from all walks of life.</i>
                                </li>
                                <li className='py-3'>
                                    <b>Excited Events & Activities</b> <br />
                                    <i className='ps-5'>We host regular events to spark connections and inspire creativity.</i>
                                </li>
                                <li className='py-3'>
                                    <b>Collaborative Spaces</b> <br />
                                    <i className='ps-5'>Our shared lounges,balconies and common areas are designed to encourage interaction and collaboration.</i>
                                </li>
                                <li className='py-3'>
                                    <b>A Supportive Environment</b> <br />
                                    <i className='ps-5'>Whether you're new to the city or looking for a fresh start, our community & our company is here to support you.</i>
                                </li>
                            </ol>
                        </InfoCard>
                    </AnimatedSection>

                    {/* How It Started */}
                    <AnimatedSection id="section8" visibleElements={visibleElements}>
                        <InfoCard title="How Stayease Started">
                            <p className='mt-8'>
                                Stayease journey started on starting of january 2024 officially but dreams,
                                preparations, research and transformation was started a year before on 2023.
                                A decade experienced professional from the hospitality industry and youngsters
                                from different niches started the first property at Electronic city, called it
                                as Stayease Harmonia.
                            </p>

                            <p className='mt-3'>
                                As electronic city is one of the hubs for IT professionals, Students and Many
                                business entrepreneurs, industry workers. It's a year right now and we had a
                                tough journey building that as it's our bootstrapped company. We loved getting
                                all the amenities and services to the residents and solving their queries as
                                early. We also have gratitude for the partners who trusted us and gave the
                                property for business. We have a great team of Transformation, Marketing,
                                Branding, Sales, Operations and Housekeeping Department.
                            </p>

                            <p className='mt-3'>
                                Stayease now onboarding properties at major cities of bangalore such ITPL,
                                Koramangala, BTM, HSR Layout and took an initiative to continue the services
                                for the residents with top amenities and comfortabilities.
                            </p>
                        </InfoCard>
                    </AnimatedSection>
                </>
            )}
        </section>
    )
})

About.displayName = 'About'

export default About