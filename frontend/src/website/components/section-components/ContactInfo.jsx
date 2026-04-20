import { BsTelephone } from "react-icons/bs"
import { GrLocation } from "react-icons/gr"
import { MdOutlineMailOutline } from "react-icons/md"
import { Link } from 'react-router-dom'
import { memo } from 'react'

// Contact data - defined outside component
const CONTACT_METHODS = [
    {
        id: 'email',
        icon: MdOutlineMailOutline,
        label: 'Email Address',
        value: 'hello@mystayease.com',
        to: 'mailto:hello@mystayease.com',
        target: '_blank',
        positionClasses: 'mb-32 md:mb-10'
    },
    {
        id: 'phone',
        icon: BsTelephone,
        label: 'Phone Number',
        value: '+91 91 6464 8787',
        to: 'https://wa.me/9164648787',
        target: '_blank',
        positionClasses: 'mb-32 md:mb-10'
    },
    {
        id: 'address',
        icon: GrLocation,
        label: 'Office Address',
        value: null,
        to: `https://www.google.com/maps?q=${encodeURIComponent('No. 216, 215, 3rd Cross, Off Neeladri Road, Electronic City Phase 1, Bengaluru 560100')}`,
        target: '_blank',
        rel: 'noopener noreferrer',
        positionClasses: 'mb-10',
        customContent: (
            <>
                <h3 className="font-semibold text-lg mb-2">Office Address</h3>
                <p className="text-gray-600 hover:text-[#eba312] transition-colors duration-300">
                    Estanzia Ease Private Limited <br />
                    No. 216,215, 3rd Cross, Off Neeladri Road, <br />
                    Electronic City Phase 1, Bengaluru 560100
                </p>
            </>
        )
    }
]

// Memoized contact card component
const ContactCard = memo(({ method }) => {
    const Icon = method.icon

    return (
        <Link
            to={method.to}
            target={method.target}
            rel={method.rel}
            className={`relative py-10 md:w-[35vw] text-center ${method.positionClasses} group`}
        >
            {/* Icon Container */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-max">
                <div className="mb-[35px] transition-transform duration-300 group-hover:scale-110">
                    <span className='text-8xl max-w-[80px] text-[#eba312]'>
                        <Icon aria-hidden="true" />
                    </span>
                </div>
            </div>

            {/* Text Container - Same for all cards */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-full px-4">
                {method.customContent ? (
                    method.customContent
                ) : (
                    <>
                        <h3 className="font-semibold text-lg mb-2">{method.label}</h3>
                        <p className="text-gray-600 hover:text-[#eba312] transition-colors duration-300">
                            {method.value}
                        </p>
                    </>
                )}
            </div>
        </Link>
    )
})

ContactCard.displayName = 'ContactCard'

const ContactInfo = memo(() => {
    return (
        <section className="p-10 md:p-24 my-24">
            <div className="flex flex-col md:flex-row justify-center gap-4">
                {CONTACT_METHODS.map((method) => (
                    <ContactCard key={method.id} method={method} />
                ))}
            </div>
        </section>
    )
})

ContactInfo.displayName = 'ContactInfo'

export default ContactInfo