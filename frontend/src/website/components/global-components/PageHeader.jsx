import { Link } from 'react-router-dom'
import { memo, useMemo } from 'react'

// Static breadcrumb icon - defined outside to prevent recreation
const HOME_ICON = <i className="fas fa-home" aria-hidden="true" />

const PageHeader = memo(({ headertitle, subheader }) => {
    // Memoize derived values to prevent recalculation on re-renders
    const displaySubheader = useMemo(() =>
        subheader || headertitle,
        [subheader, headertitle]
    )

    return (
        <section className='relative py-[1rem] md:py-20 lg:py-[8rem] mt-[4rem]'>
            {/* Background Image - eager loading for LCP optimization */}
            <div className="w-full h-full overflow-hidden" aria-hidden="true">
                <img
                    src="static/img/bg/pageHeader.webp"
                    alt=""
                    className="object-cover absolute inset-0 w-full h-full opacity-50"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high" // Prioritize this image as it's above the fold
                />
            </div>

            {/* Content container */}
            <div className="h-[18vh] md:h-[20vh]">
                <div className="absolute top-[28%] md:top-[40%] xl:top-[48%] left-[7%]">
                    {/* Page title */}
                    <h1 className="text-2xl md:text-4xl font-semibold">
                        {headertitle}
                    </h1>

                    {/* Breadcrumb navigation */}
                    <div className="pt-8">
                        <ul className='flex space-x-5 font-semibold'>
                            <li>
                                <Link to="/" className="hover:text-[#eba312] transition-colors duration-200">
                                    {HOME_ICON}
                                    <span> Home</span>
                                </Link>
                            </li>

                            {/* Separator - using character instead of JSX for better performance */}
                            <li aria-hidden="true">›</li>

                            {/* Current page indicator */}
                            <li className='text-[#eba312]'>
                                {displaySubheader}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
})

// Display name for debugging
PageHeader.displayName = 'PageHeader'

export default PageHeader