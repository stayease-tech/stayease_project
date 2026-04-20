import React, { useState, useEffect, useCallback } from 'react'
import PropertyDetailsFetch from '../PropertyDetailsFetch'
import MapComponent from './MapComponent'
import IconSlider from './IconSlider'
// import Slider from 'react-slick'
// import "slick-carousel/slick/slick.css"
// import "slick-carousel/slick/slick-theme.css"
import Cookies from 'js-cookie'
import axios from 'axios'
import { LoadingSpinner } from "../../Routing"
import DateAndTime from '../DateAndTime'

const PropertyEnquiry1 = ({ pathname }) => {
    const { propertyArray, loading } = PropertyDetailsFetch();
    const property = propertyArray.filter(property => (property.propertyPathname === pathname))
    // let publicUrl = process.env.PUBLIC_URL + '/'

    const [slideIndex, setSlideIndex] = useState(1)

    const formattedDateAndTime = DateAndTime()

    // const settings = {
    //     infinite: true,
    //     speed: 500,
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    //     autoplay: true,
    //     autoplaySpeed: 3000,
    //     arrows: false,
    //     dots: false,
    // }

    // const communityImages = [
    //     [
    //         publicUrl + "static/img/community/community_img1.webp",
    //         publicUrl + "static/img/community/community_img2.webp",
    //         publicUrl + "static/img/community/community_img3.webp"
    //     ],
    //     [
    //         publicUrl + "static/img/community/community_img4.webp",
    //         publicUrl + "static/img/community/community_img5.webp",
    //         publicUrl + "static/img/community/community_img6.webp"
    //     ],
    //     [
    //         publicUrl + "static/img/community/community_img7.webp",
    //         publicUrl + "static/img/community/community_img8.webp",
    //         publicUrl + "static/img/community/community_img9.webp"
    //     ]
    // ]

    let lgGridCols = "md:grid-cols-2";

    if (property[0]?.neighbourhood_images.length === 3 || property[0]?.neighbourhood_images.length === 6) { lgGridCols = "md:grid-cols-3" };
    if (property[0]?.neighbourhood_images.length === 4 || property[0]?.neighbourhood_images.length === 8) { lgGridCols = "md:grid-cols-4" };

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        property: property[0]?.propertyName || '',
        submittedAt: formattedDateAndTime
    })
    const [isSubmitting, setIsSubmitting] = useState(false);

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e) => {
        touchStartX = e.targetTouches[0].clientX
    }

    const handleTouchMove = (e) => {
        touchEndX = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
        if (touchStartX - touchEndX > 50) {
            plusSlides(1)
        } else if (touchEndX - touchStartX > 50) {
            plusSlides(-1)
        }
    }

    const currentSlide = (index) => setSlideIndex(index)
    const plusSlides = useCallback((n) => setSlideIndex((prev) => ((prev - 1 + n + 5) % 5) + 1), [])

    useEffect(() => {
        const intervalId = setInterval(() => {
            plusSlides(1)

        }, 3000)


        return () => clearInterval(intervalId)

    }, [plusSlides])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    useEffect(() => {
        if (property?.length > 0) {
            setFormData(prev => ({
                ...prev,
                property: property[0]?.propertyName || ''
            }));
        }
    }, [property]);

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await axios.post('/visit-enquiry/', formData, {
                credentials: 'include',
            });

            alert(res.data.message);

            setFormData({
                name: '',
                phone: '',
                email: '',
            })
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const priceBoard = <>
        {property[0]?.priceboard_details.map((priceData, index) => (
            <div
                key={index}
                className={`flex justify-between p-3 border border-[#eba312] ${index !== 0 ? "mt-3" : ""}`}
            >
                <div className='font-semibold'>{priceData.roomType}</div>
                <div className='font-semibold'>{priceData.roomRent}
                    <p className='text-xs text-center'>Rent onwards</p>
                </div>
            </div>
        ))}
    </>

    const enquiryBoard = <>
        <h2 className="text-2xl font-semibold text-[#eba312]">Book Your Visit Today</h2>

        <form onSubmit={handleSubmit} className='text-left mt-3' method='POST'>
            <div className="mb-3">
                <label className="block text-sm font-medium mb-2" htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="border rounded w-full py-2 px-3 text-[#000000]" />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-2" htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="border rounded w-full py-2 px-3 text-[#000000]" />
            </div>

            <div className="mb-5">
                <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="border rounded w-full py-2 px-3 text-[#000000]" />
            </div>

            <button type="submit" className="bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600" disabled={isSubmitting}>
                Submit
            </button>
        </form>
    </>

    if (loading) return <LoadingSpinner />;

    return (
        <section className='pt-20 md:pt-[6rem]'>
            <div className="mx-auto text-center py-10 md:p-[4rem]">

                <div className="flex flex-col md:flex-row md:space-x-20 lg:mx-5">
                    <div
                        className="relative w-full overflow-hidden group"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="relative w-full h-[50vh] md:h-[75vh]">
                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${slideIndex === 1 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={property[0]?.livingRoom}
                                    alt='Living Room'
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
                                    1 / 5
                                </div>
                            </div>

                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${slideIndex === 2 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={property[0]?.bedRoom}
                                    alt='Bed Room'
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
                                    2 / 5
                                </div>
                            </div>

                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${slideIndex === 3 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={property[0]?.kitchenArea}
                                    alt='kitchen Area'
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
                                    3 / 5
                                </div>
                            </div>

                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${slideIndex === 4 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={property[0]?.bathroom}
                                    alt='Bathroom'
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
                                    4 / 5
                                </div>
                            </div>

                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${slideIndex === 5 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={property[0]?.commonArea}
                                    alt='common_Area'
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
                                    5 / 5
                                </div>
                            </div>
                        </div>

                        <button
                            className="prev absolute top-[50%] left-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300"
                            onClick={() => plusSlides(-1)}
                        >
                            ❮
                        </button>
                        <button
                            className="next absolute top-[50%] right-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300"
                            onClick={() => plusSlides(1)}
                        >
                            ❯
                        </button>
                    </div>

                    <div className="flex justify-center hidden lg:block">
                        <div className="">
                            <img
                                className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${slideIndex === 1 ? 'opacity-100' : 'opacity-60'}`}
                                src={property[0]?.livingRoom}
                                alt='Thumbnail_Img1'
                                onClick={() => currentSlide(1)}
                                loading="eager"
                            />
                        </div>

                        <div className="">
                            <img
                                className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${slideIndex === 2 ? 'opacity-100' : 'opacity-60'}`}
                                src={property[0]?.bedRoom}
                                alt='Thumbnail_Img2'
                                onClick={() => currentSlide(2)}
                                loading="eager"
                            />
                        </div>

                        <div className="">
                            <img
                                className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${slideIndex === 3 ? 'opacity-100' : 'opacity-60'}`}
                                src={property[0]?.kitchenArea}
                                alt='Thumbnail_Img3'
                                onClick={() => currentSlide(3)}
                                loading="eager"
                            />
                        </div>

                        <div className="">
                            <img
                                className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${slideIndex === 4 ? 'opacity-100' : 'opacity-60'}`}
                                src={property[0]?.bathroom}
                                alt='Thumbnail_Img4'
                                onClick={() => currentSlide(4)}
                                loading="eager"
                            />
                        </div>

                        <div className="">
                            <img
                                className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${slideIndex === 5 ? 'opacity-100' : 'opacity-60'}`}
                                src={property[0]?.commonArea}
                                alt='Thumbnail_Img5'
                                onClick={() => currentSlide(5)}
                                loading="eager"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-[2rem] md:mb-[2rem] lg:mb-[4rem]">
                    <span
                        className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === 1 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        onClick={() => currentSlide(1)}
                    ></span>
                    <span
                        className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === 2 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        onClick={() => currentSlide(2)}
                    ></span>
                    <span
                        className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === 3 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        onClick={() => currentSlide(3)}
                    ></span>
                    <span
                        className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === 4 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        onClick={() => currentSlide(4)}
                    ></span>
                    <span
                        className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === 5 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        onClick={() => currentSlide(5)}
                    ></span>
                </div>


                <div className='flex flex-col lg:flex-row md:space-x-10'>
                    <div className='lg:w-[55vw]'>
                        <div className='p-3 lg:p-8 text-left rounded-lg lg:border md:border-slate-200 md:mt-0 m-5'>
                            <h3 className='text-2xl font-semibold my-3 text-[#eba312]'>{property[0]?.propertyName} ({property[0]?.propertyLocation})</h3>
                            <p>
                                {property[0]?.propertyDescription}
                            </p>
                        </div>

                        <div className="px-8 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8 border border-[#eba312] rounded-lg m-5 lg:hidden">
                            {priceBoard}
                            <p className='text-xs text-right pt-2 md:pt-3'>T&C Applied</p>
                        </div>

                        <div className='p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5'>
                            <h3 className='text-xl font-semibold my-5 text-[#eba312]'>Address</h3>
                            <p>
                                {property[0]?.propertyAddress}
                            </p>
                            <MapComponent iframeLink={property[0]?.propertyIframeLink} />
                        </div>

                        <div className='p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5'>
                            <IconSlider />
                        </div>

                        {/* <div className='p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5'>
                            <h3 className='text-xl font-semibold my-5'>About StayEase Community</h3>

                            <ul className='mt-[3.5rem]'>
                                <li className='mb-[3rem] md:mb-[5rem] lg:mb-[4rem] xl:mb-20 flex flex-col md:flex-row lg:flex-col xl:flex-row md:space-x-10 lg:space-x-1 xl:space-x-10'>
                                    <Slider {...settings} className='md:w-[40vw] lg:w-[100%] xl:w-[25vw]'>
                                        {communityImages[0].map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Slide_${index + 1}`}
                                                className="md:w-full lg:w-full xl:w-full h-[40%] md:h-[45vh] xl:h-[40vh] object-cover"
                                                loading="lazy"
                                            />
                                        ))}
                                    </Slider>

                                    <div className='md:text-[1.5vw] lg:text-base md:w-[100vw] lg:w-[45vw] xl:w-[100vw] mt-8 md:mt-8 lg:mt-8 xl:mt-9'>
                                        <h3 className='md:text-[1.8vw] lg:text-lg font-semibold mb-5 font-semibold mb-5'>A Spectrum Of Experiences</h3>
                                        StayEase isn’t just a place to live, it’s a vibrant community where different backgrounds and perspectives come together. Experience the richness of diverse lives in our coliving spaces. StayEase offers more than just a room - it’s a gateway to a colorful community.
                                    </div>
                                </li>

                                <li className='mb-[3rem] md:mb-[5rem] lg:mb-[4rem] xl:mb-20 flex flex-col-reverse md:flex-row lg:flex-col-reverse xl:flex-row md:space-x-5 lg:space-x-1 xl:space-x-10'>
                                    <div className='md:text-[1.5vw] lg:text-base md:w-[100vw] lg:w-[100%] xl:w-[100vw] mt-8 md:mt-8 lg:mt-8 xl:mt-9'>
                                        <h3 className='md:text-[1.8vw] lg:text-lg font-semibold mb-5'>Connect & Collaborate</h3>
                                        Our shared spaces are the heart and soul of StayEase. More than just functional areas, our common areas and communal lounges are where connections are forged. Whether you're sharing a coffee or a competitive game night, these are the places where our community truly comes alive.
                                    </div>

                                    <Slider {...settings} className='md:w-[40vw] lg:w-[100%] xl:w-[25vw]'>
                                        {communityImages[1].map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Slide_${index + 1}`}
                                                className="md:w-full lg:w-full xl:w-full h-[40%] md:h-[45vh] xl:h-[40vh] object-cover"
                                                loading="lazy"
                                            />
                                        ))}
                                    </Slider>
                                </li>

                                <li className='mb-5 flex flex-col md:flex-row lg:flex-col xl:flex-row md:space-x-5 lg:space-x-1 xl:space-x-10'>
                                    <Slider {...settings} className='md:w-[40vw] lg:w-[100%] xl:w-[25vw]'>
                                        {communityImages[2].map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Slide_${index + 1}`}
                                                className="md:w-full lg:w-full xl:w-full h-[40%] md:h-[45vh] xl:h-[40vh] object-cover"
                                                loading="lazy"
                                            />
                                        ))}
                                    </Slider>

                                    <div className='md:text-[1.5vw] lg:text-base md:w-[100vw] lg:w-[100%] xl:w-[100vw] mt-8 md:mt-0 lg:mt-8 xl:mt-6'>
                                        <h3 className='md:text-[1.8vw] lg:text-lg font-semibold mb-5'>Build Long Lasting Bondings</h3>
                                        {property.propertyDescription}
                                    </div>
                                </li>
                            </ul>
                        </div> */}

                        <div className='p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5'>
                            <h3 className='text-xl font-semibold my-5 text-[#eba312]'>Neighbourhood from {property[0]?.propertyName}</h3>

                            <div className={`grid grid-cols-2 p-1 gap-1 sm:grid-cols-2 ${lgGridCols}`}>
                                {property[0]?.neighbourhood_images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.image}
                                        alt={`Image_${index + 1}`}
                                        className="w-full h-[20vh] sm:h-[25vh] object-cover"
                                        loading="lazy"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className='p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5'>
                            <h3 className='text-xl font-semibold my-5 text-[#eba312]'>Basic House Rules For Comfortable Stay</h3>
                            <ul>
                                <li className='mb-5'>
                                    <span className='font-semibold'>Move-in/Move-out:</span>&nbsp; Move-in is permitted after 3:00 PM and move-out must be completed before 10:00 AM. Keep valuables locked. Management is not responsible for lost or stolen items. CCTV footage for common areas is available upon request (up to 10 days). Delivery personnel are not allowed inside.
                                </li>
                                <li className='mb-5'>
                                    <span className='font-semibold'>Guest Policy:</span>&nbsp; Only single or full occupancy is allowed, subject to approval and as outlined in the agreement. Guests are strictly prohibited in double or shared occupancy.Conserve water and electricity. Maintain cleanliness in your room and common areas.
                                </li>
                                <li className='mb-5'>
                                    <span className='font-semibold'>Repairs & Electricity:</span>&nbsp; A cool-off period applies before repair costs become your responsibility (see agreement). Costs are shared for shared accommodations. Electricity is pay-as-you-go with smart meters, including power backup. Report maintenance issues immediately.
                                </li>
                                <li className='mb-5'>
                                    <span className='font-semibold'>Noise & Substances:</span>&nbsp; Maintain low noise levels in rooms and common areas. Smoking and drinking are prohibited in common areas with a ₹1000 fine for the first offense and potential eviction for repeated violations. Drugs are strictly prohibited, resulting in eviction and police reporting.
                                </li>
                            </ul>
                        </div>

                        <div className="p-10 rounded-lg border border-[#eba312] m-5 lg:hidden">
                            {enquiryBoard}
                        </div>
                    </div>

                    <div className="relative md:m-0 hidden lg:block lg:w-[40vw]">
                        <div className='sticky top-10 pb-5'>
                            <div className="px-8 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8 border border-[#eba312] rounded-lg mb-10">
                                {priceBoard}
                                <p className='text-xs text-right pt-2 md:pt-3'>T&C Applied</p>
                            </div>

                            <div className="p-10 border border-[#eba312] rounded-lg shadow-custom">
                                {enquiryBoard}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PropertyEnquiry1
