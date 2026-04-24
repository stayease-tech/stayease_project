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

function MoveOutFeedbackForm() {
    let publicUrl = process.env.PUBLIC_URL + '/';

    const [searchParams] = useSearchParams();

    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    const [moveOutFeedbackData, setMoveOutFeedbackData] = useState({
        residentId: searchParams.get('residentId'),
        overallStayExperience: 0,
        cleanlinessPropertyStay: 0,
        responsivenessPropertyTeam: 0,
        commonareaKitchenExperience: 0,
        recommendStayease: 0,
        likeMostAboutStay: "",
        couldImprove: ""
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

    const moveOutFeedbackHandleChange = (e) => {
        const { name, value } = e.target;

        setMoveOutFeedbackData(prev => (
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

    const moveOutFeedbackHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/operations/moveoutfeedback-form-submit/', moveOutFeedbackData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(response.data.message);

            if (response.data.success) {
                setMoveOutFeedbackData(prevState => ({
                    ...prevState,
                    overallStayExperience: 0,
                    cleanlinessPropertyStay: 0,
                    responsivenessPropertyTeam: 0,
                    commonareaKitchenExperience: 0,
                    recommendStayease: 0,
                    likeMostAboutStay: "",
                    couldImprove: ""
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

            <form className="max-lg:min-h-screen w-[100%] lg:w-[85%] mx-auto lg:my-8 pt-6 px-8 lg:p-10 lg:rounded-lg bg-white text-slate-800" onSubmit={moveOutFeedbackHandleSubmit} method='POST'>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">MOVE-OUT FEEDBACK FORM</h1>

                <h3 className="font-semibold mb-5 text-stone-400 max-sm:text-sm">Rate your feedback here...</h3>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>1. Overall stay experience:</strong></label>

                    <StarRatingInput
                        rating={moveOutFeedbackData.overallStayExperience}
                        setRating={(value) => setMoveOutFeedbackData({ ...moveOutFeedbackData, overallStayExperience: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>2. Cleanliness and property upkeep throughout the stay:</strong></label>

                    <StarRatingInput
                        rating={moveOutFeedbackData.cleanlinessPropertyStay}
                        setRating={(value) => setMoveOutFeedbackData({ ...moveOutFeedbackData, cleanlinessPropertyStay: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>3. Responsiveness of the property team:</strong></label>

                    <StarRatingInput
                        rating={moveOutFeedbackData.responsivenessPropertyTeam}
                        setRating={(value) => setMoveOutFeedbackData({ ...moveOutFeedbackData, responsivenessPropertyTeam: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>4. Common area & kitchen experience:</strong></label>

                    <StarRatingInput
                        rating={moveOutFeedbackData.commonareaKitchenExperience}
                        setRating={(value) => setMoveOutFeedbackData({ ...moveOutFeedbackData, commonareaKitchenExperience: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="roomNumber" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>5. Would you recommend Stayease Harmonia to others?:</strong></label>

                    <StarRatingInput
                        rating={moveOutFeedbackData.recommendStayease}
                        setRating={(value) => setMoveOutFeedbackData({ ...moveOutFeedbackData, recommendStayease: value })}></StarRatingInput>
                </div>

                <hr className="border-b-1 border-stone-400 my-5" />

                <label htmlFor="likeMostAboutStay" className="block mt-3 text-[#D4A017] max-sm:text-sm"><strong>What did you like the most about your stay? (Optional):</strong></label>
                <input
                    type="text"
                    value={moveOutFeedbackData.likeMostAboutStay}
                    onChange={moveOutFeedbackHandleChange}
                    name="likeMostAboutStay"
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                    placeholder="Enter any additional comments here"
                />

                <label htmlFor="couldImprove" className="block mt-3 text-[#D4A017] max-sm:text-sm"><strong>What could we improve? (Optional):</strong></label>
                <input
                    type="text"
                    value={moveOutFeedbackData.couldImprove}
                    onChange={moveOutFeedbackHandleChange}
                    name="couldImprove"
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

export default MoveOutFeedbackForm