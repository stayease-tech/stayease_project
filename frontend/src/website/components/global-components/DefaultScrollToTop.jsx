import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Scrolls to top of page whenever route changes
 * Renders nothing (null component)
 */
const DefaultScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        // Instant scroll to top on route change (no animation)
        window.scrollTo(0, 0)
    }, [pathname]) // Re-run effect when pathname changes

    return null // This component renders nothing
}

export default DefaultScrollToTop