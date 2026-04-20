import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';

function RawdataFileUpload({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();

    const [rawdataFile, setRawdataFile] = useState('')

    const [isUploading, setIsUploading] = useState(false);

    const triggerFileInput = (type) => {
        if (type === "rawdataFile") {
            document.getElementById("rawdataFile").click();
        }
    };

    const rawDataHandleChange = (e) => {
        setRawdataFile(e.target.files[0]);
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const rawdataFileUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        const formData = new FormData();

        formData.append("rawdataFile", rawdataFile);

        try {
            const response = await axios.post('/accounts/rawdata-file-upload/', formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                setRawdataFile('');

                navigate(`/accounts/accounts-rawdatafile-table/`);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-3`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={rawdataFileUpload} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">RAW DATA UPLOAD</h1>

                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Upload your Raw data here</h3>

                        <label htmlFor="rawdataFile" className="text-[#D4A017] max-sm:text-sm">
                            <strong>Raw Data:</strong>
                        </label>

                        <input
                            type="file"
                            id="rawdataFile"
                            name="rawdataFile"
                            accept=".xlsx, .xls, .csv"
                            onChange={rawDataHandleChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => triggerFileInput('rawdataFile')}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm bg-white text-left flex gap-3"
                        >
                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{rawdataFile?.name || 'No file chosen'}</span>
                        </button>

                        <button
                            className="block w-full mt-8 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                            type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RawdataFileUpload