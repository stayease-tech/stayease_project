import React from 'react'
import { Link } from 'react-router-dom'

const Blog = () => {
    let publicUrl = process.env.PUBLIC_URL + '/'

    return (
        <div className="pt-[3rem] md:pt-[4.5rem] pb-[1rem] md:pb-[2rem]">
            <div className='text-center mb-5'>
                <h1 className="text-2xl md:text-3xl font-semibold my-3 md:my-5 text-[#eba312]">Top Reads</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:gap-5 px-3 md:px-5 lg:px-8">
                <Link className="group" to='/blog/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore'>
                    <img src={publicUrl + "static/img/blog/blog_img2.webp"} alt={`BlogImage_1`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Sep 8, 2024</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Top Benefits of Co-Living or Sharing Accommodation for Millennials in Bangalore</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/red-flags-to-watch-out-for-before-shifting-to-a-coliving-space-in-bangalore'>
                    <img src={publicUrl + "static/img/blog/blog_img3.webp"} alt={`BlogImage_2`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 11, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Red Flags to Watch Out for Before Shifting to a Co-Living
                            Space in Bangalore</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/pet-friendly-coliving-spaces'>
                    <img src={publicUrl + "static/img/blog/blog_img4.avif"} alt={`BlogImage_3`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 11, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Pet-Friendly Coliving Spaces: A Haven for You and Your Furry Friend</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/coliving-vs-pgs-and-rented-flats'>
                    <img src={publicUrl + "static/img/blog/blog_img5.jpeg"} alt={`BlogImage_4`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 11, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Women-Friendly Coliving Spaces: A Safe Haven for Independent Living</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/women-friendly-coliving-spaces'>
                    <img src={publicUrl + "static/img/blog/blog_img6.jpeg"} alt={`BlogImage_5`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 22, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Coliving vs PGs &amp; Rented Flats: The Smarter Choice for Young
                            Professionals</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/rent-right-or-regret-later'>
                    <img src={publicUrl + "static/img/blog/blog_img7.jpg"} alt={`BlogImage_6`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 22, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Rent Right or Regret Later: Why a Rental Agreement is a Must-Have!</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/new-city-new-digs'>
                    <img src={publicUrl + "static/img/blog/blog_img8.jpg"} alt={`BlogImage_6`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Feb 22, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>New City, New Digs? Your Rental Agreement Can Unlock EMIs!</h3>
                    </div>
                </Link>

                <Link className="group" to='/blog/roomies-real-life-growth'>
                    <img src={publicUrl + "static/img/blog/blog_img9.jpg"} alt={`BlogImage_6`} className="w-full h-[35vh] mt-5 object-cover" loading="lazy" />
                    <div className='mb-10 px-1 pt-3'>
                        <p className='text-xs mb-3'>Mar 11, 2025</p>
                        <h3 className='font-bold text-xl mb-3 group-hover:text-[#eba312] transition duration-300'>Roomies, Real Life &amp; Growth: How Shared Living Shapes Student Life</h3>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Blog
