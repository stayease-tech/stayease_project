import { useState, forwardRef, useCallback, memo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

// Constants
const INITIAL_FORM_STATE = {
    name: '',
    phone: '',
    email: '',
    comments: '',
    submittedAt: ''
}

// Helper function to format date
const formatSubmittedAt = () => {
    const date = new Date();

    // Get day with leading zero
    const day = date.getDate().toString().padStart(2, '0');

    // Get month abbreviation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];

    // Get full year
    const year = date.getFullYear();

    // Get hours in 12-hour format
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Get minutes with leading zero
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

// Memoized form input component
const FormInput = memo(({ id, label, type = 'text', value, onChange, required = true, ...props }) => (
    <div className="mb-3">
        <label className="block text-sm font-medium mb-2" htmlFor={id}>
            {label}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            required={required}
            className="border rounded w-full py-2 px-3 text-[#000000] focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            {...props}
        />
    </div>
))

FormInput.displayName = 'FormInput'

// Memoized textarea component
const FormTextarea = memo(({ id, label, value, onChange, rows = 4, ...props }) => (
    <div className="mb-5">
        <label className="block text-sm font-medium mb-2" htmlFor={id}>
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            rows={rows}
            value={value}
            onChange={onChange}
            className="border rounded w-full p-2 text-[#000000] focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            {...props}
        />
    </div>
))

FormTextarea.displayName = 'FormTextarea'

// Memoized submit button with disabled state
const SubmitButton = memo(({ isSubmitting }) => (
    <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-amber-500 text-white mt-3 py-2 px-4 rounded transition-colors duration-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-amber-600'
            }`}
    >
        {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
))

SubmitButton.displayName = 'SubmitButton'

const EnquirySection = forwardRef((props, ref) => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Memoized change handler
    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }, [])

    // Memoized submit handler
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()

        // Disable button
        setIsSubmitting(true)

        // Add submittedAt to form data
        const dataToSend = {
            ...formData,
            submittedAt: formatSubmittedAt()
        };

        const csrftoken = Cookies.get('csrftoken');

        try {
            const res = await axios.post('/normal-enquiry/', dataToSend, {
                headers: {
                    'X-CSRFToken': csrftoken
                }
            })
            alert(res.data.message)
            setFormData(INITIAL_FORM_STATE) // Reset form on success
        } catch (error) {
            console.error('Error submitting enquiry:', error)
            alert('Failed to submit enquiry. Please try again.')
        } finally {
            // Re-enable button regardless of success or failure
            setIsSubmitting(false)
        }
    }, [formData])

    return (
        <section ref={ref} className='py-8 md:pt-[1rem] lg:px-24 mb-[30rem] md:mb-[2.5rem] lg:mb-[5rem]'>
            {/* Header */}
            <div className='text-center mb-[3rem]'>
                <h1 className="text-2xl md:text-3xl font-semibold my-5 text-[#eba312]">
                    SEND US YOUR ENQUIRY
                </h1>
            </div>

            <div className='flex flex-col lg:flex-row lg:space-x-20'>
                {/* Left Image Section - Desktop Only */}
                <div className='relative lg:h-[90vh] hidden lg:block'>
                    <img
                        src="static/img/connect-bg/connect_img.webp"
                        alt="Connect with StayEase"
                        className='w-[95vw] h-[70] lg:h-[90vh] lg:w-[55vw] opacity-75 object-cover'
                        loading="lazy"
                        decoding="async"
                    />
                    <div className='absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4'>
                        <h2 className="text-4xl font-semibold text-white">CONNECT WITH STAYEASE</h2>
                        <p className='text-white mt-5'>Drop your concern, query or feedback</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="relative md:w-[75vw] lg:w-[45vw] md:h-[85vh] lg:h-[90vh]">
                    <div className="absolute left-[5%] md:left-[16%] lg:left-[10%] lg:top-[13%] w-[90%] md:w-[100%] lg:w-[85%]">
                        <form onSubmit={handleSubmit} className='text-left mt-3' noValidate>
                            <FormInput
                                id="name"
                                label="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <FormInput
                                id="phone"
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                            <FormInput
                                id="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <FormTextarea
                                id="comments"
                                label="Your Requirements"
                                value={formData.comments}
                                onChange={handleChange}
                            />

                            <SubmitButton isSubmitting={isSubmitting} />
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
})

EnquirySection.displayName = 'EnquirySection'

export default EnquirySection