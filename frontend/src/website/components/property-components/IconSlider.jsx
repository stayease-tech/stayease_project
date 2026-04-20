import { useRef, useCallback, memo } from 'react'
import { IoLocation } from "react-icons/io5"
import { RiSofaFill } from "react-icons/ri"
import { LuCircleParking } from "react-icons/lu"
import { MdOutlineCleaningServices } from "react-icons/md"
import { FaWifi } from "react-icons/fa"
import { FaKitchenSet } from "react-icons/fa6"
import { TbDeviceCctv } from "react-icons/tb"
import { GiWashingMachine } from "react-icons/gi"
import { BsPersonWorkspace } from "react-icons/bs"
import { CgCommunity } from "react-icons/cg"
import { FaHouseLock } from "react-icons/fa6"
import { FaHandHoldingWater } from "react-icons/fa"
import { MdLiveTv } from "react-icons/md"
import { SiIntercom } from "react-icons/si"

// Constants - moved outside component
const SCROLL_AMOUNT = 200

// Icons data - moved outside component to prevent recreation
const ICONS = [
    { id: 1, icon: <IoLocation />, iconName: 'Prime Location' },
    { id: 2, icon: <RiSofaFill />, iconName: 'Fully Furnished' },
    { id: 3, icon: <LuCircleParking />, iconName: 'Parking Space' },
    { id: 4, icon: <MdOutlineCleaningServices />, iconName: 'Regular Housekeeping' },
    { id: 5, icon: <FaWifi />, iconName: 'Free Wi-Fi' },
    { id: 6, icon: <FaKitchenSet />, iconName: 'Modular Kitchen' },
    { id: 7, icon: <TbDeviceCctv />, iconName: 'CCTV Surveillance' },
    { id: 8, icon: <GiWashingMachine />, iconName: 'Washing Machine' },
    { id: 9, icon: <BsPersonWorkspace />, iconName: 'Workspace Setup' },
    { id: 10, icon: <CgCommunity />, iconName: 'Common Area' },
    { id: 11, icon: <FaHouseLock />, iconName: 'Digital Lock Access' },
    { id: 12, icon: <FaHandHoldingWater />, iconName: 'Water Purifier' },
    { id: 13, icon: <MdLiveTv />, iconName: 'OTT Subscriptions' },
    { id: 14, icon: <SiIntercom />, iconName: 'Community Intercom' },
]

// Memoized icon item component - adjusted height for name visibility
const IconItem = memo(({ element }) => (
    <div className='relative flex-shrink-0 w-[7rem] md:w-[10vw] lg:w-[7vw]'>
        <div className="relative w-full h-[16vh] lg:h-[18vh] transition duration-500 text-center shadow-custom">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 border border-white rounded-lg size-20">
                <span className="text-[#f7b600] text-5xl">{element.icon}</span>
            </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center w-full px-1 mt-2">
            <span className="text-sm font-medium block leading-tight">
                {element.iconName}
            </span>
        </div>
    </div>
))

IconItem.displayName = 'IconItem'

const IconSlider = memo(() => {
    const scrollRef = useRef(null)

    // Memoized scroll handlers
    const scrollLeft = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: 0,
                left: -SCROLL_AMOUNT,
                behavior: 'smooth',
            })
        }
    }, [])

    const scrollRight = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: 0,
                left: SCROLL_AMOUNT,
                behavior: 'smooth',
            })
        }
    }, [])

    return (
        <div className="relative">
            <h3 className='text-xl font-semibold my-5 text-[#eba312]'>
                Our Offerings & Amenities
            </h3>

            <button
                className="absolute left-[-3.5%] top-1/2 transform -translate-y-1/2 text-2xl font-bold hidden md:block z-10"
                onClick={scrollLeft}
            >
                ❮
            </button>

            <div className="overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex space-x-4 overflow-x-auto md:overflow-x-hidden pt-5 px-2 lg:px-3 scrollbar-hide items-start h-[32vh]"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {ICONS.map((element) => (
                        <IconItem key={element.id} element={element} />
                    ))}
                </div>
            </div>

            <button
                className="absolute right-[-3.5%] top-1/2 transform -translate-y-1/2 text-2xl font-bold hidden md:block z-10"
                onClick={scrollRight}
            >
                ❯
            </button>

            {/* Hide scrollbar for webkit browsers */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
})

IconSlider.displayName = 'IconSlider'

export default IconSlider