// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useNavigate, useLocation } from "react-router-dom";
import { DashPage } from "../../../shared/Dashboard";

function MoveOutFeedbackData() {
    const navigate = useNavigate();
    const location = useLocation();
    const moveOutFeedbackData = location.state?.data;

    return (
        <DashPage>
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">MOVE-OUT FEEDBACK DATA</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate(`/operations/operations-checklistfeedback-table`)}
                        type="button"
                    >
                        Prev
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-3 p-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">1. Overall stay experience</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.overallStayExperience} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">2. Cleanliness and property upkeep throughout the stay</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.cleanlinessPropertyStay} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">3. Responsiveness of the property team</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.responsivenessPropertyTeam} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">4. Common area &amp; kitchen experience</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.commonareaKitchenExperience} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">5. Would you recommend Stayease Harmonia to others?</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.recommendStayease} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">What did you like the most about your stay?</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.likeMostAboutStay}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">What could we improve?</p>
                            <p className="text-xs text-gray-800">{moveOutFeedbackData?.couldImprove}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashPage>
    );
}

export default MoveOutFeedbackData;
