import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';

function OtherFilesForm({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();

    const [otherFile, setOtherFile] = useState({
        propertyName: "",
        fileName: '',
        file: ''
    })

    const [isUploading, setIsUploading] = useState(false);

    const triggerFileInput = (type) => {
        if (type === "file") {
            document.getElementById("file").click();
        }
    };

    const otherFilesHandleChange = (e) => {
        if (e.target.type === 'file') {
            const file = e.target.files?.[0];
            if (file) {
                setOtherFile(prev => ({
                    ...prev,
                    file: file,
                }));
            }
        } else {
            const { name, value } = e.target;
            setOtherFile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const otherFilesUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        const formData = new FormData();

        formData.append("propertyName", otherFile.propertyName);
        formData.append("fileName", otherFile.fileName);
        formData.append("file", otherFile.file);

        try {
            const response = await axios.post('/accounts/other-files-upload/', formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                setOtherFile({
                    propertyName: "",
                    fileName: '',
                    file: ''
                });

                navigate(`/accounts/accounts-otherfiles-table/`);
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
                    <form className="w-[100%] lg:w-[95%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={otherFilesUpload} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">OTHER FILES UPLOAD</h1>

                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Upload your files here</h3>

                        <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name:</strong></label>
                        <input type="text" id="propertyName" value={otherFile.propertyName} onChange={otherFilesHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="propertyName" placeholder="Enter the Property Name here" required />

                        <label htmlFor="fileName" className="text-[#D4A017] max-sm:text-sm"><strong>File Name:</strong></label>
                        <input type="text" id="fileName" value={otherFile.fileName} onChange={otherFilesHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="fileName" placeholder="Enter the File Name here" required />

                        <label htmlFor="file" className="text-[#D4A017] max-sm:text-sm">
                            <strong>File:</strong>
                        </label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept=".xlsx, .xls, .csv, .pdf, image/*"
                            onChange={otherFilesHandleChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => triggerFileInput('file')}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm bg-white text-left flex gap-3"
                        >
                            <span className="mt-1 text-lg"><FaUpload /></span>
                            <span className="mt-1 text-xs sm:text-sm truncate w-64">{otherFile.file?.name || 'No file chosen'}</span>
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

export default OtherFilesForm