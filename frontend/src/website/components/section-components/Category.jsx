import React, { useState, useEffect, useRef } from 'react'
import { IoLocation } from "react-icons/io5";
import { RiSofaFill } from "react-icons/ri";
import { LuCircleParking } from "react-icons/lu";
import { MdOutlineCleaningServices } from "react-icons/md";
import { FaWifi } from "react-icons/fa";
import { FaKitchenSet } from "react-icons/fa6";
import { TbDeviceCctv } from "react-icons/tb";
import { GiWashingMachine } from "react-icons/gi";
import { BsPersonWorkspace } from "react-icons/bs";
import { CgCommunity } from "react-icons/cg";
import { FaHouseLock } from "react-icons/fa6";
import { FaHandHoldingWater } from "react-icons/fa";
import { MdLiveTv } from "react-icons/md";
import { SiIntercom } from "react-icons/si";

const Category = () => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            { threshold: 0.5 }
        )

        if (ref.current) observer.observe(ref.current)

        return () => observer.disconnect()
    }, [])

    return (
        <div className='py-8 md:py-5 px-5 md:px-[6rem] lg:px-[6.1rem]'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">Our Offerings & Amenities</h1>
            </div>

            <div className='grid grid-cols-3 grid-cols-4 lg:grid-cols-6 gap-5'>
                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><IoLocation /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Prime Locations</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><RiSofaFill /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Fully Furnished</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><LuCircleParking /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Parking Space</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><MdOutlineCleaningServices /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Regular Housekeeping</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><FaWifi /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Free Wi-Fi</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><FaKitchenSet /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Modular Kitchen</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><TbDeviceCctv /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">CCTV Surveillance</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><GiWashingMachine /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Washing Machine</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><BsPersonWorkspace /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Workspace Setup</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><CgCommunity /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Common Area</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><FaHouseLock /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Digital Lock Access</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><FaHandHoldingWater /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Water Purifier</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><MdLiveTv /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">OTT Subscriptions</span>
                </div>

                <div className="relative h-[21vh] md:h-[35vh]">
                    <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border border-white rounded-lg transition ease-in-out delay-150 hover:scale-90 duration-300">
                        <span className="text-4xl md:text-7xl text-[#eba312]"><SiIntercom /></span>
                    </div>
                    <span className="absolute top-[90%] sm:top-[85%] md:top-[83%] lg:top-[83%] xl:top-[78%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-base font-bold text-center">Community Intercom</span>
                </div>
            </div>

            <div ref={ref} className={`${isVisible ? 'animate-slide-up' : 'opacity-0'} transition-all mt-10 md:ps-8 xl:pe-[30rem] md:border-l-2 border-[#eba312] w-full max-w-max`}>
                <p>
                    We go beyond just offering stylish, fully furnished rooms and apartments. We provide a comprehensive package of offerings and amenities designed to simplify your living experience at Stayease. These are just a few of the offerings that set us apart. We're committed to providing you with everything you need to live at complete convenience.
                </p>
            </div>
        </div>
    )
}

export default Category
