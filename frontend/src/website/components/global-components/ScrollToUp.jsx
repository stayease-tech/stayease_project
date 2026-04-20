import { useState, useEffect, useCallback, memo } from 'react'
import { FaArrowUp } from 'react-icons/fa'

// Scroll threshold constant - defined outside component
const SCROLL_THRESHOLD = 100

const ScrollToTop = memo(() => {
    const [isVisible, setIsVisible] = useState(false)

    // Memoized scroll handler - only created once
    const toggleVisibility = useCallback(() => {
        // Direct comparison without if-else for better performance
        setIsVisible(window.pageYOffset > SCROLL_THRESHOLD)
    }, []) // Empty deps because it doesn't depend on any props/state

    // Memoized scroll function - stable reference
    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }, [])

    // Optimized scroll listener with passive flag
    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility, { passive: true })
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [toggleVisibility]) // Only re-run if toggleVisibility changes

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-5 right-5 bg-white text-black p-3 rounded-full shadow-custom-shadow hover:bg-amber-500 hover:text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    title="Go to top"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp aria-hidden="true" />
                </button>
            )}
        </>
    )
})

// Display name for debugging
ScrollToTop.displayName = 'ScrollToTop'

export default ScrollToTop