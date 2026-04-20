import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function FeedbackForm() {
    let publicUrl = process.env.PUBLIC_URL + '/';
    const { id } = useParams();

    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    const [feedbackData, setFeedbackData] = useState({
        complaintId: id,
        issueResolved: '',
        ratings: 0,
        suggestions: ''
    });

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

    const feedbackHandleChange = (e) => {
        const { name, value } = e.target;

        setFeedbackData(prev => (
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

    const feedbackHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/operations/feedback-form-submit/', feedbackData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(response.data.message);

            if (response.data.success) {
                setFeedbackData(prevState => ({
                    ...prevState,
                    issueResolved: '',
                    rating: 0,
                    suggestions: ''
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

            <form className="max-lg:min-h-screen w-[100%] lg:w-[85%] mx-auto lg:my-8 pt-6 px-8 lg:p-10 lg:rounded-lg bg-white text-slate-800" onSubmit={feedbackHandleSubmit} method='POST'>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">FEEDBACK FORM</h1>

                <h3 className="font-semibold mb-5 text-stone-400 max-sm:text-sm">Please rate your feedback here...</h3>

                <div className="flex flex-col sm:flex-row sm:space-x-3 mb-5">
                    <label htmlFor="issueResolved" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>Was the issue resolved to your satisfaction?</strong></label>
                    <select
                        value={feedbackData.issueResolved}
                        name="issueResolved"
                        onChange={feedbackHandleChange}
                        className="mt-2 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                        required
                    >
                        <option value="" disabled>Select your option here</option>
                        <option value="Yes">Yes</option>
                        <option value="Partially">Partially</option>
                        <option value="No">No</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row space-x-3 mb-5">
                    <label htmlFor="ratings" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>How would you rate the resolution process?</strong></label>
                    <StarRatingInput
                        rating={feedbackData.ratings}
                        setRating={(value) => setFeedbackData({ ...feedbackData, ratings: value })}></StarRatingInput>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-3 mb-5">
                    <label htmlFor="suggestions" className="text-[#D4A017] max-sm:text-sm mt-1"><strong>Comments / Suggestions (if any):</strong></label>
                    <input
                        type="text"
                        value={feedbackData.suggestions}
                        onChange={feedbackHandleChange}
                        name="suggestions"
                        className="mt-2 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                        placeholder="Enter any additional comments here"
                    />
                </div>

                <button
                    className="block mt-5 w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
            </form>
        </div>
    )
}

export default FeedbackForm