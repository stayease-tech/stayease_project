import React, { useState } from "react"
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PropertyDetailsFetch from "../PropertyDetailsFetch"
import { LoadingSpinner } from "../../Routing"

const PrevArrow = (props) => {
    const { onClick } = props
    return (
        <div
            className="hidden bg-white text-black hover:bg-amber-500 hover:text-white md:block absolute left-[-50px] top-1/2 transform -translate-y-1/2 p-3 rounded-full z-10 text-xl text-black opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 cursor-pointer" onClick={onClick}>
            <FaArrowLeft />
        </div>
    )
}

const NextArrow = (props) => {
    const { onClick } = props
    return (
        <div
            className="hidden bg-white text-black hover:bg-amber-500 hover:text-white md:block absolute right-[-50px] top-1/2 transform -translate-y-1/2 p-3 rounded-full z-10 text-xl text-black opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 cursor-pointer" onClick={onClick}>
            <FaArrowRight />
        </div>
    )
}

const ProductSlider = ({ marginTop, heading, pathname }) => {
    const { propertyArray, loading } = PropertyDetailsFetch()
    const [activeSlide, setActiveSlide] = useState(0)
    const [slidesToScroll, setSlidesToScroll] = useState(3)

    const settings = {
        dots: true,
        customPaging: i => (
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${i === Math.floor(activeSlide / slidesToScroll) ? "bg-[#eba312]" : "bg-white"
                }`} />
        ),
        afterChange: (current) => {
            setActiveSlide(current)
        },
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 3000,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    beforeChange: () => setSlidesToScroll(2)
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    beforeChange: () => setSlidesToScroll(1)
                },
            },
        ],
    }

    let predefinedOrder = ["/stayease-harmonia", "/stayease-nestio"];
    const seenPathnames = new Set(predefinedOrder);

    propertyArray.forEach(item => {
        if (item.propertyPathname && !seenPathnames.has(item.propertyPathname)) {
            predefinedOrder.push(item.propertyPathname);
            seenPathnames.add(item.propertyPathname);
        }
    });

    propertyArray.sort((a, b) => {
        const isAEmpty = !a.propertyPathname;
        const isBEmpty = !b.propertyPathname;

        if (isAEmpty && isBEmpty) return 0;
        if (isAEmpty) return 1;
        if (isBEmpty) return -1;

        return predefinedOrder.indexOf(a.propertyPathname) - predefinedOrder.indexOf(b.propertyPathname);
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className={`${(marginTop || heading) ? marginTop : 'mt-[3rem] md:mt-[3rem]'} md:mt-0 ${heading ? 'mb-14' : 'md:py-5 lg:py-14'} px-3 md:px-[4rem] lg:px-24`}>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">Featured Properties</h1>
            </div>

            <div className={`${marginTop ? 'hidden' : ''}`}>
                <Slider {...settings} className="relative group">
                    {propertyArray.map((product, index) => (
                        pathname === product.propertyPathname ? '' : (
                            <div className="w-[calc((100vw-60px)/3)] mb-5 px-3 md:px-5" key={index}>
                                <div className="relative">
                                    <div className='overflow-hidden rounded-lg'>
                                        <div className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300'>
                                            <img src={product.productImg} alt="PropertyImg" className="w-full h-[40vh] h-[45vh] object-cover" loading="lazy" />
                                            <Link to={product.propertyPathname} className='absolute top-8 right-5 bg-[#eba312] text-white px-3 py-1 text-sm' type='button'>
                                                BOOK NOW
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="text-center mt-3 px-5 py-3 border border-white rounded-lg">
                                        <p className='font-semibold text-[#eba312]'>{product.propertyName}</p>
                                        <p className='mt-1 text-sm'>{product.propertyLocation}</p>
                                        <p className='text-sm'>Sharing starts from: ₹{product.propertyRoomRent}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </Slider>
            </div>

            <div className={`${marginTop ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-3 md:px-5' : 'hidden'}`}>

                {propertyArray.map((product, index) => (
                    <div className="relative mb-5" key={index}>
                        <div className='overflow-hidden rounded-lg'>
                            <div className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300'>
                                <img src={product.productImg} alt="PropertyImg" className="w-full md:h-[45vh]" />
                                <Link to={product.propertyPathname} className='absolute top-8 right-5 bg-[#eba312] text-white px-3 py-1 text-sm' type='button'>
                                    BOOK NOW
                                </Link>
                            </div>
                        </div>

                        <div className="text-center mt-3 px-5 py-3 border border-white rounded-lg">
                            <p className='font-semibold text-[#eba312]'>{product.propertyName}</p>
                            <p className='mt-1 text-sm'>{product.propertyLocation}</p>
                            <p className='text-sm'>Sharing starts from: ₹{product.propertyRoomRent}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductSlider
