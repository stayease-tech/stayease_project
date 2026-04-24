import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

const StarRatingInput = ({ rating, setRating }) => {
    const [hover, setHover] = useState(null);

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`text-2xl ${star <= (hover || rating) ? 'text-[#D4A017]' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(null)}
                >
                    ★
                </button>
            ))}
            <span className="ml-2 text-sm text-stone-400">
                {rating || 'Rate'}
            </span>
        </div>
    );
};

function MoveInFeedbackForm() {
    let publicUrl = process.env.PUBLIC_URL + '/';

    const [searchParams] = useSearchParams();

    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    const [moveInFeedbackData, setMoveInFeedbackData] = useState({
        residentId: searchParams.get('residentId'),
        cleanlinessRoomWashroom: 0,
        functionalityAppliancesUtilities: 0,
        comfortSetupRoom: 0,
        staffBehaviorCheckinExperience: 0,
        overallImpressionStayease: 0,
        overallComments: ""
    })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 80) {
            setIsScrolledUp(false);
        } else if (currentScrollPosition < lastScrollPosition) {
            setIsScrolledUp(true);
        }

        setLastScrollPosition(currentScrollPosition)
    }, [lastScrollPosition])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [lastScrollPosition, handleScroll])

    const moveInFeedbackHandleChange = (e) => {
        const { name, value } = e.target;

        setMoveInFeedbackData(prev => (
            {
                ...prev,
                [name]: value
            }
        ))
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const moveInFeedbackHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/operations/moveinfeedback-form-submit/', moveInFeedbackData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(response.data.message);

            if (response.data.success) {
                setMoveInFeedbackData(prevState => ({
                    ...prevState,
                    cleanlinessRoomWashroom: 0,
                    functionalityAppliancesUtilities: 0,
                    comfortSetupRoom: 0,
                    staffBehaviorCheckinExperience: 0,
                    overallImpressionStayease: 0,
                    overallComments: ""
                }))
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="lg:pb-2 pt-[5rem] lg:pt-[6rem]">
            <nav className={`bg-slate-800 shadow-md text-white fixed w-full top-0 z-[100] transition-opacity duration-300 ${isScrolledUp ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <img alt="CompanyLogo" src={publicUrl + "static/img/brand_logo/stayEase-Logo.webp"} className="h-18 w-auto object-cover"
                                loading="lazy" />
                        </div>
                    </div>
                </div>
            </nav>

            <form className="max-lg:min-h-screen w-[100%] lg:w-[85%] mx-auto lg:my-8 pt-6 px-8 lg:p-10 lg:rounded-lg bg-white text-slate-800" onSubmit={moveInFeedbackHandleSubmit} method='POST'>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">MOVE-IN FEEDBACK FORM</h1>

                <h3 className="font-semibold mb-5 text-stone-400 max-sm:text-sm">Rate your feedback here...</h3>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>1. Cleanliness of the room and washroom:</strong></label>

                    <StarRatingInput
                        rating={moveInFeedbackData.cleanlinessRoomWashroom}
                        setRating={(value) => setMoveInFeedbackData({ ...moveInFeedbackData, cleanlinessRoomWashroom: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>2. Functionality of appliances and utilities:</strong></label>

                    <StarRatingInput
                        rating={moveInFeedbackData.functionalityAppliancesUtilities}
                        setRating={(value) => setMoveInFeedbackData({ ...moveInFeedbackData, functionalityAppliancesUtilities: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>3. Comfort and setup of the room:</strong></label>

                    <StarRatingInput
                        rating={moveInFeedbackData.comfortSetupRoom}
                        setRating={(value) => setMoveInFeedbackData({ ...moveInFeedbackData, comfortSetupRoom: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>4. Staff behavior and check-in experience:</strong></label>

                    <StarRatingInput
                        rating={moveInFeedbackData.staffBehaviorCheckinExperience}
                        setRating={(value) => setMoveInFeedbackData({ ...moveInFeedbackData, staffBehaviorCheckinExperience: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>5. Overall first impression of Stayease Harmonia:</strong></label>

                    <StarRatingInput
                        rating={moveInFeedbackData.overallImpressionStayease}
                        setRating={(value) => setMoveInFeedbackData({ ...moveInFeedbackData, overallImpressionStayease: value })}></StarRatingInput>
                </div>

                <hr className="border-b-1 border-stone-400 my-5" />

                <label htmlFor="overallComments" className="block mt-3 text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                <input
                    type="text"
                    value={moveInFeedbackData.overallComments}
                    onChange={moveInFeedbackHandleChange}
                    name="overallComments"
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                    placeholder="Enter any additional comments here"
                />

                <div className="max-lg:pb-8">
                    <button
                        className="block mt-5 w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                </div>
            </form>
        </div>
    )
}

export default MoveInFeedbackForm