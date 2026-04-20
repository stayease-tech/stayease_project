import React from 'react'
import { useLocation } from 'react-router-dom'
import Blog1 from './blog-components/Blog1'
import Blog2 from './blog-components/Blog2'
import Blog3 from './blog-components/Blog3'
import Blog4 from './blog-components/Blog4'
import Blog5 from './blog-components/Blog5'
import Blog6 from './blog-components/Blog6'
import Blog7 from './blog-components/Blog7'
import Blog8 from './blog-components/Blog8'

const MainBlog = () => {
    const location = useLocation();

    const blogMapping = {
        "/blog/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore": <Blog1 />,
        "/blog/red-flags-to-watch-out-for-before-shifting-to-a-coliving-space-in-bangalore": <Blog2 />,
        "/blog/pet-friendly-coliving-spaces": <Blog3 />,
        "/blog/coliving-vs-pgs-and-rented-flats" : <Blog4 />,
        "/blog/women-friendly-coliving-spaces" : <Blog5 />,
        "/blog/rent-right-or-regret-later" : <Blog6 />,
        "/blog/new-city-new-digs" : <Blog7 />,
        "/blog/roomies-real-life-growth" : <Blog8 />,
    };

    return <div>
        {blogMapping[location.pathname] || <div>Blog Not Found</div>}
    </div>
}

export default MainBlog
