import { useState, useEffect, useRef, memo } from 'react'
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

// Constants
const OBSERVER_THRESHOLD = 0.5

// Amenities data - defined outside component to prevent recreation
const AMENITIES = [
    { id: 1, icon: IoLocation, label: "Prime Locations" },
    { id: 2, icon: RiSofaFill, label: "Fully Furnished" },
    { id: 3, icon: LuCircleParking, label: "Parking Space" },
    { id: 4, icon: MdOutlineCleaningServices, label: "Regular Housekeeping" },
    { id: 5, icon: FaWifi, label: "Free Wi-Fi" },
    { id: 6, icon: FaKitchenSet, label: "Modular Kitchen" },
    { id: 7, icon: TbDeviceCctv, label: "CCTV Surveillance" },
    { id: 8, icon: GiWashingMachine, label: "Washing Machine" },
    { id: 9, icon: BsPersonWorkspace, label: "Workspace Setup" },
    { id: 10, icon: CgCommunity, label: "Common Area" },
    { id: 11, icon: FaHouseLock, label: "Digital Lock Access" },
    { id: 12, icon: FaHandHoldingWater, label: "Water Purifier" },
    { id: 13, icon: MdLiveTv, label: "OTT Subscriptions" },
    { id: 14, icon: SiIntercom, label: "Community Intercom" }
]

// Memoized amenity card component
const AmenityCard = memo(({ icon: Icon, label }) => (
    <div className="relative h-[21vh] md:h-[35vh] flex flex-col items-center justify-center">
        {/* Icon Container */}
        <div className="p-5 border border-white rounded-lg transition-all duration-300 ease-in-out hover:scale-90 hover:border-[#eba312]">
            <span className="text-4xl md:text-7xl text-[#eba312]">
                <Icon aria-hidden="true" />
            </span>
        </div>

        {/* Label */}
        <span className="mt-4 text-xs md:text-sm lg:text-base font-bold text-center">
            {label}
        </span>
    </div>
))

AmenityCard.displayName = 'AmenityCard'

const Amenities = memo(() => {
    const [isVisible, setIsVisible] = useState(false)
    const textRef = useRef(null)

    // Set up intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (textRef.current) {
                        observer.unobserve(textRef.current)
                    }
                }
            },
            { threshold: OBSERVER_THRESHOLD }
        )

        const currentRef = textRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, []) // Empty dependency array - runs once on mount

    return (
        <div className='py-8 md:py-5 px-5 md:px-[6rem] lg:px-[6.1rem]'>
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">
                    OUR OFFERINGS & AMENITIES
                </h1>
            </div>

            {/* Amenities Grid */}
            <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5'>
                {AMENITIES.map(({ id, icon, label }) => (
                    <AmenityCard
                        key={id}
                        icon={icon}
                        label={label}
                    />
                ))}
            </div>

            {/* Animated Text Section */}
            <div
                ref={textRef}
                className={`${isVisible ? 'animate-slide-up' : 'opacity-0'
                    } transition-all mt-10 md:ps-8 xl:pe-[30rem] md:border-l-2 border-[#eba312] w-full max-w-max`}
            >
                <p>
                    We go beyond just offering stylish, fully furnished rooms and apartments.
                    We provide a comprehensive package of offerings and amenities designed to
                    simplify your living experience at Stayease. These are just a few of the
                    offerings that set us apart. We're committed to providing you with everything
                    you need to live at complete convenience.
                </p>
            </div>
        </div>
    )
})

Amenities.displayName = 'Amenities'

export default Amenities