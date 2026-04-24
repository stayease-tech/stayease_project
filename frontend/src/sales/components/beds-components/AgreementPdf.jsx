/* global html2pdf */
import React, { useState, useRef } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function AgreementPdf({ isExpanded, setIsExpanded }) {
    let publicUrl = process.env.PUBLIC_URL + '/';
    const navigate = useNavigate();
    const location = useLocation();
    const bedsData = location?.state?.bedsData || [];
    const bedData = location?.state?.bedData || {};
    const flag = location?.state?.flag || false;
    const bedsDetailsFlag = location?.state?.bedsDetailsFlag || false;
    const pdfRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pdfDetails, setPdfDetails] = useState({
        title: `${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`,
        recipientEmail: bedData?.resident_data?.email,
        recipientName: bedData?.resident_data?.residentsName,
        pdfFile: null
    });

    function getMonthsBetweenDates(startDateStr, endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();

        return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    }

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const pdfHandleChange = (e) => {
        const { name, files } = e.target;

        setPdfDetails((prevState) => ({
            ...prevState,
            [name]: files[0],
        }));
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const handleSendPdf = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);

        // if (pdfDetails.pdfFile?.name.replace(/\s*\([^)]*\)/g, '') !== `${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`) {
        //     alert('Uploaded file is different from the one that is downloaded!');
        //     return;
        // }

        const formData = new FormData();

        formData.append('title', pdfDetails.title);
        formData.append('recipientEmail', pdfDetails.recipientEmail);
        formData.append('recipientName', pdfDetails.recipientName);
        formData.append('pdfFile', pdfDetails.pdfFile);

        try {
            const response = await axios.post('/sales/send/', formData, {
                withCredentials: true,
            });

            alert(response.data.message);

            console.log(pdfDetails)

            if (response.data.success) {
                setPdfDetails({
                    title: '',
                    recipientEmail: '',
                    recipientName: '',
                    pdfFile: null
                });
            }
        } catch (err) {
            console.error('Error submitting file:', err);
            alert('There was an error submitting the file. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDownload = async () => {
        const content = document.getElementById('content');

        const options = {
            margin: 0,
            filename: `${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                scrollX: 0,
                scrollY: 0,
                useCORS: true,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf()
            .set(options)
            .from(content)
            .save();
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>

                    <div className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">AGREEMENT</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="block max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => bedsDetailsFlag ? navigate(`/sales/sales-resident-details/${bedData?.resident_data?.id}`, { state: { bedsData, bedData, flag } }) : navigate(`/sales/sales-beds-table`)}
                                type="button">Prev</button>

                            <div className='sm:flex gap-3'>
                                <button
                                    className="block mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm max-sm:w-full" onClick={openModal} type="button">Send PDF</button>
                                <button
                                    className="block mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm max-sm:w-full" onClick={handleDownload}
                                    type="button">Download PDF</button>
                            </div>
                        </div>

                        {isModalOpen && (
                            <div
                                className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50"
                                onClick={closeModal}
                            >
                                <div
                                    className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        Please download the file first and upload the file from downloads
                                    </h2>

                                    <p className="text-gray-600 mb-6">
                                        <input
                                            type="file"
                                            name="pdfFile"
                                            accept="image/*, .pdf"
                                            onChange={pdfHandleChange}
                                        />
                                    </p>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type='submit'
                                            onClick={handleSendPdf}
                                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>

                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center items-center">
                            <div ref={pdfRef} id="content" className="overflow-y-auto h-auto flex flex-col bg-white text-black">
                                <section className="relative px-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="flex justify-end">
                                        <img alt="CompanyLogo" src={publicUrl + "static/img/stayEase_icon.ico"} className="h-[12rem] w-auto object-cover" loading="lazy" />
                                    </div>

                                    <div className="mb-[3rem] w-full">
                                        <table className="border-collapse border border-black w-full">
                                            <tbody className='text-center'>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2 w-[50%]"><b>Community Manager</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.propertyManager}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Room No.</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.roomNo}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">
                                                        <b>Type of Accommodation for use as residence</b></td>
                                                    <td className="py-1 px-2"><b>{`${bedData?.roomType} Room`}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Monthly User Fee</b></td>
                                                    <td className="py-1 px-2"><b>{`₹${bedData?.resident_data?.rentPerMonth}`}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Duration of Stay (“Term”)</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.checkOut ? `${getMonthsBetweenDates(bedData?.resident_data?.checkIn, bedData?.resident_data?.checkOut)} Months` : '-'}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Agreement Start Date</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.checkIn ? new Date(bedData.resident_data?.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Agreement End Date</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.checkOut ? new Date(bedData.resident_data?.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Move Out Time</b></td>
                                                    <td className="py-1 px-2"><b>12.00 PM</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Security Deposit</b></td>
                                                    <td className="py-1 px-2"><b>{`₹${bedData?.resident_data?.totalDepositPaid}`}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>User Fee Due Date</b></td>
                                                    <td className="py-1 px-2"><b>1st of every month</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Stayease Property (“Premise”) name and address</b></td>
                                                    <td className="py-1 px-2"><b>{`${bedData?.propertyName}`}</b> - {`${bedData?.doorBuilding}, ${bedData?.streetAddress}, ${bedData?.streetAddress}, ${bedData?.area}, ${bedData?.city}, ${bedData?.state} - ${bedData?.pincode}`}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <h3 className="text-center mb-[2rem] text-xl"><b>ANNEXURE A</b></h3>

                                    <div className="w-full">
                                        <table className="border-collapse border border-black w-full">
                                            <tbody className='text-center'>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2 w-[50%]"><b>Name of User</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.residentsName}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Permanent Address</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.permanentAddress}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Phone Number (To be used for communication and notices)</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.phoneNumber}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Email (To be used for communication and notices)</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.email}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Resident Identity Type</b></td>
                                                    <td className="py-1 px-2"><b>{`${bedData?.resident_data?.kycType} Card`}</b></td>
                                                </tr>

                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2"><b>Resident Identity Number</b></td>
                                                    <td className="py-1 px-2"><b>{bedData?.resident_data?.kycType === 'Aadhar' ? bedData?.resident_data?.aadharNumber : bedData?.resident_data?.panNumber}</b></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <h3 className="text-center font-bold pb-5">USER SUBSCRIPTION AGREEMENT</h3>

                                    <p className="pb-5">This User Subscription Agreement (“Agreement”) is executed between:</p>

                                    <p className="pb-5">ESTANZIA EASE Private Limited ("STAYEASE")., a company incorporated under the
                                        provisions of the Companies Act, 1956 bearing CIN U55200KA2024PTC185682, having its
                                        registered office at No, represented herein by its Community Manager AND the User (as
                                        named in Annexure A). The User and Stayease are together referred to as "Parties' ' and
                                        individually as "Party".
                                    </p>

                                    <b className="pb-5">WHEREAS</b>

                                    <p>A. Stayease is engaged in the business of providing fully furnished and operational hospitality
                                        services, for use for aimed accommodation of a ‘residential’ nature.</p>

                                    <p className="pb-5">B. The User intends to use the Premises on a subscription basis from Stayease for
                                        residential
                                        accommodation purposes and Stayease has agreed to provide the same.
                                    </p>

                                    <p className="pb-5">NOW, THIS AGREEMENT CONTAINS THE CONDITIONS OF USE GRANTED TO THE USER</p>

                                    <p className="pb-5"><b>1. TERM:</b> As per Annexure A.</p>

                                    <p className="pb-5"><b>2. PREMISES:</b> As per Annexure A.</p>

                                    <p className="pb-5"><b>3. USER CHARGES/ FEE:</b> As per Annexure A. The User Charges for each month for the
                                        Premises used for residential accommodation shall be paid by User on or before the Due Date
                                        for every month in advance. Charges for any incidental or additional service are not a part of
                                        User Fee. The User shall be liable to pay such incidental or additional charges as and when
                                        they become due to a relevant party. The User shall not withhold payment of the User Fee for
                                        any reason whatsoever, including any disputes. Withholding payments shall be deemed to be a
                                        breach of this Agreement. The User Fee does not include any taxes, cesses, duties, etc., and
                                        the same shall be charged by Stayease, as applicable by the laws in force, if any.
                                    </p>

                                    <p><b>4. REFUNDABLE SECURITY DEPOSIT:</b> On the date of execution of this Agreement, the
                                        User has agreed to deposit; with Stayease, in trust, a security deposit of (Thousand
                                        Rupees Only "Deposit"), as security for the performance of the User's obligations under this
                                        Agreement. Stayease may at its discretion use the Deposit or any part thereof to cure any
                                        breach or default by the User under this Agreement, or to compensate Stayease for any
                                        damage that occurs/is caused as a result of the User's act or omission to perform any of the
                                        User's obligations hereunder. Stayease's right is not limited to the Deposit to recoup damage
                                        costs, and the User remains liable for payment of the balance dues under this Agreement.
                                        The User shall not apply or deduct any portion of the Deposit from any month's User Fee,
                                        including the last month of the Term. The User shall not use or apply the Deposit in lieu of
                                        payment of User Fee. The Deposit shall not carry any interest. The Deposit will be refunded
                                        to the User after 45 working days from the Subscription End Date after deducting unpaid
                                        charges/damages, if any. The refund will be done only through online transfer.</p>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <p className="pb-5"><b>5. MANNER OF PAYMENT:</b>  The User Fee, and all other sums payable by the User to
                                        Stayease under this Agreement, shall be payable in Indian Rupee and shall be paid to the
                                        bank account of Stayease bearing bank account No. 8294210000010478, IFSC:
                                        DBSSOIN0294 with beneficiary name as 'ESTANZIA EASE (Stayease) PRIVATE LIMITED'
                                        (Online transfer only) for UPI Payments UPI ID - mystayease@dbs. Such payment shall be
                                        credited to the bank account of the Stayease on or before the fifth (5th) of every month in
                                        advance for the month. For Online Transfer - Credit Date on the bank a/c of the Stayease, will
                                        be taken as the date and the "Late Payment Fees" (Refer Annexure A) will be calculated
                                        proportionately. Please note Cash is not accepted as a manner of payment. For Cheque - The
                                        date of cheque deposit will be taken as the date of payment and late payment fees, if any will
                                        be calculated from the said date proportionately. The User will be informed of details via email.
                                        Without prejudice to Stayease's right to take legal action, the User agrees to pay a charge of
                                        Rs.500 (Rupees Five Hundred only)
                                    </p>

                                    <p className="pb-5">a) for each cheque provided by the User under this Agreement that is bounced for lack of
                                        sufficient funds or incorrect signature.
                                    </p>

                                    <p className="pb-5">b) for incorrect details of the cheque deposit is submitted. Stayease shall intimate the
                                        User on
                                        the registered email ID about the change of mode of payment of all such payments under this
                                        agreement acceptable by the Stayease.
                                    </p>

                                    <p className="pb-5">
                                        <b>6. MOVE OUT AND DEDUCTIONS:</b> At the Subscription End Date, a Move-out Audit would be
                                        carried out by a representative of Stayease after scheduling and communicating it with the User
                                        or on before the Subscription End Date, on the basis of which the damages, other property
                                        maintenance expenses is ascertained.
                                    </p>

                                    <p className="pb-5">
                                        Please note, property maintenance is a fixed charge which includes activities like overhead
                                        water tank cleaning, underground sump cleaning, common area pest control, lift maintenance,
                                        generator maintenance, waste management and any other maintenance related to the common
                                        areas of the building. Property maintenance will also be applicable on change of property as
                                        well as on the completion of the stay period of 11 months in the same premise.
                                    </p>

                                    <p className="pb-5">
                                        Property maintenance charge will only be applicable after the stay of more than one month in
                                        the same property. Further, to ensure the room and the property is well maintained Deep
                                        Cleaning, Fumigation and Painting would be carried out based on the move-out audit.
                                    </p>

                                    <p className="pb-5">
                                        An estimate of the Maintenance Expenses is given in Annexure A, which will attract a 10%
                                        escalation on a yearly basis for inflation. Please note, that in case the actual costs are above
                                        the amounts mentioned in Annexure A, the higher amount would be deducted.
                                    </p>

                                    <p className="pb-5">
                                        The User shall, on or before the Agreement Commencement Date, hand over possession of the
                                        Schedule Property complete with facilities / amenities and requirements in respect of the
                                        Schedule Property as per the move-in audit conducted at the time of moving in.
                                    </p>

                                    <p>
                                        <b>7. LIMITED USE:</b> The User agrees and understands that he/she is granted a limited use of the
                                        Premises for residential purpose only, subject to timely payment of the User Fee and other
                                        charges. The rights granted hereunder are not intended to be in the nature of a licence or leave
                                    </p>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <p className="pb-5">
                                        and licence, or create any right, title, interest,or tenancy in property, shall be only for the
                                        purpose of personal use for residential use
                                    </p>

                                    <p className="pb-5">
                                        <b>8. BACKGROUND VERIFICATION:</b> Stayease shall be entitled to carry out background
                                        verification on the User before or at any point of time Subscription Term through any agency
                                        and the cost for such background verification (Rs.500) shall be borne by the User.
                                    </p>

                                    <p className="pb-5">
                                        <b>9. USER CHARGES DEFAULT:</b> If any amounts due under this Agreement are not paid within
                                        the due date, the User agrees to pay a late fee to Stayease as mentioned in Annexure A
                                    </p>

                                    <p className="pb-5">
                                        <b>10. LOCK IN PERIOD:</b> In the event the Subscription Term as mentioned in Annexure A is not
                                        more than six (6) months, the entire Subscription Term shall be considered as lock-in period. In
                                        the event the Subscription Term is greater than six (6) months, the first six (6) months shall be
                                        considered as lock-in period.
                                    </p>

                                    <p className="pb-5">
                                        <b>11. TERMINATION GENERALLY:</b> If User defaults in fulfilling any of the covenants of this
                                        Agreement, the User shall be in default or breach of this Agreement. Then, in any one or more
                                        of such events (or other than default as captured in Clause 12), and upon Stayease serving a
                                        written/email seven (7) days’ notice upon the User specifying the nature of said default and
                                        upon the expiration of said seven (7) days, if the User does not cure a default of which he has
                                        been notified, to the satisfaction of Stayease, or if the default cannot be completely cured or
                                        remedied in seven (7) days, Stayease may at Stayease’s option: (i) cure such default and add
                                        the cost of such cure to the User’s financial obligations under this Agreement; or (ii) declare that
                                        the User is in default and terminate the Agreement immediately and other consequences in the
                                        Agreement shall follow.
                                    </p>

                                    <p className="pb-5">
                                        <b>12. SPECIFIC TERMINATION:</b> In the event of default from the User on the payment of the User
                                        Charges, Utility charges, and other charges under this Agreement, for a period more than two
                                        (2) weeks, Stayease shall be entitled to terminate the Agreement by giving seven (7) days
                                        written notice to pay the outstanding dues. After expiry of the notice period of seven (7) days, if
                                        the User fails to rectify default in payment of outstanding dues, Stayease shall terminate this
                                        Agreement immediately, by deducting the outstanding dues and two (2) months User
                                        Charges/Fee payable.
                                    </p>

                                    <p className="pb-5">
                                        In case, the Agreement is terminated by the User within the lock-in period, Stayease shall be
                                        entitled to deduct one month’s User Fee which shall be deducted from the Deposit at the time of
                                        moving out (“Contract Termination Charges”). If the User terminates the Agreement during the
                                        lock-in period/ after the expiry of the lock-in period without prior intimation of one month to
                                        Stayease, the User Fee of one month shall be levied on the User which shall be deducted from
                                        the Deposit at the time of moving out.
                                    </p>

                                    <p>
                                        Hereinafter referred to as “Notice Period Charges”. Such intimation should be given through an
                                        email on hello@mystayease.com. If this Agreement is terminated/ expires prior to the expiry of
                                        a calendar month, Stayease shall charge User Fee for the remainder of the month and the User
                                        shall not be allowed to stay beyond the end of that month. In case, the User terminates this
                                    </p>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <p className="pb-5">
                                        Agreement within the lock in period and without one month’s notice to Stayease, both the
                                        Contract Termination and Notice Period Charges shall be levied on the User as penalty and the
                                        same shall be recovered from the Deposit.
                                    </p>

                                    <p className="pb-5">
                                        The User Subscription agreement shall be terminated on the termination/expiry of the
                                        agreement with the property owner, with a prior 30 days notice. In such an event, the User shall
                                        be entitled to pay the User fee for the notice period. The deductions shall remain same as
                                        mentioned in Clause 6. In the following events, Stayease shall terminate the Agreement
                                        immediately with deduction of two months User Fee:
                                    </p>

                                    <ul className="list-disc px-10 pb-5">
                                        <li>Involved in any illegal activity within or outside the Premises</li>
                                        <li>Involved in drug abuse</li>
                                        <li>Misbehaviour with the other occupants of the Premises and Stayease</li>
                                        <li>Any other situation at the discretion of Stayease</li>
                                        <li>In the event the dues payable by the User exceeds 50% of the Deposit.</li>
                                    </ul>

                                    <p className="pb-5">
                                        The User shall not be entitled to request the Stayease to adjust the User fee from the security
                                        deposit at any point of time during the License Term.
                                    </p>

                                    <p className="pb-5">
                                        In the event the User stays in the Premises even after the expiry or termination of the
                                        Agreement, without prejudice to the rights of Stayease to take appropriate legal action against
                                        the User under this Agreement or under law, the User shall be liable to pay twice the amount of
                                        prorated User Fee per day to Stayease.
                                    </p>

                                    <p className="pb-5">
                                        <b>13. PHYSICAL REMEDIES:</b> In case of termination under Clauses 12, the User shall hand over
                                        the possession of the Premises to Stayease within two (2) days from the date of termination. In
                                        the event, the User fails to hand overthe Premises, Stayease shall be entitled to take
                                        possession of the Premises upon completion of the said timeline.
                                    </p>

                                    <p className="pb-5">
                                        <b>14. MAINTENANCE OF PREMISES:</b> User shall use the Premises, common area, furniture and
                                        all other amenities provided in the Premises carefully and not cause any damage to the same.
                                    </p>

                                    <p className="pb-5">
                                        15.In the event of a water scarcity situation arising from the depletion of borewells or the unavailability of water sources, resulting in the necessity of relying on water tankers for water supply, the associated charges shall be distributed equitably among all residents. It is hereby agreed that 50% of the charges shall be borne by the service provider, while the remaining 50% shall be shared equally among all residents residing within the premises. This allocation of charges aims to ensure fairness and mutual responsibility among all parties involved, fostering cooperation and solidarity during challenging circumstances
                                    </p>

                                    <p className="pb-5">
                                        <b>16. RENEWAL:</b> This Agreement is valid for the duration of the Term only. If agreeable to the
                                        Parties, an additional agreement extending the duration of the Term, for the duration as may be
                                        agreed between the Parties, may be executed after expiry of the Term.
                                    </p>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <p className="pb-5">
                                        <b>17. NOTICES:</b> All other notices, including a notice to arbitrate, may be served through an email
                                        at hello@mystayease.com or through a physical letter delivered by registered post to the
                                        registered addresses or to the Premises. For delivery through an email, email delivery receipt
                                        shall be considered as proof.
                                    </p>

                                    <p className="pb-5">
                                        <b>18. ENTIRE AGREEMENT:</b> The terms and provisions along with any annexures issued
                                        pursuant thereto form the entire and final Agreement between the Parties. No modification,
                                        amendment or waiver of any provisions of this Agreement will be effective unless made in
                                        writing with mutual consent of the Parties.
                                    </p>

                                    <p className="pb-5">
                                        <b>19. SEVERABILITY:</b> If any term of this Agreement is held to be illegal, invalid or unenforceable,
                                        in whole or in part, other than such terms, the remaining terms shall not be affected.
                                    </p>

                                    <p className="pb-5">
                                        20. <b>GOVERNING LAW, JURISDICTION & DISPUTE RESOLUTION:</b> This Agreement shall be
                                        governed by and enforced as per the Laws in India and for the purpose of enforcement; the
                                        place of jurisdiction will be the city in which the Premises are located.
                                    </p>

                                    <p className="pb-5">
                                        All disputes shall be submitted for arbitration by a sole arbitrator under the Arbitration and
                                        Conciliation Act, 1996. In the event of any dispute arising out of or in connection with the
                                        Agreement, the Parties shall, at first instance, attempt to amicably resolve the same through
                                        settlement discussions (recorded by way of email or telephonic conversations).
                                    </p>

                                    <p className="pb-5">
                                        If Parties are unable to resolve their disputes within thirty (30)days of written intimation, the
                                        disputes will be referred to arbitration under the Arbitration and Conciliation Act, 1996 and its
                                        amendments from time to time. The arbitration will be conducted by a sole arbitrator appointed
                                        by mutual consent within 7 (seven) days of the receipt of the notice to arbitrate.
                                    </p>

                                    <p className="pb-5">
                                        If Parties are unable to mutually agree, the Stayease shall have the right to appoint a sole
                                        arbitrator within three (3)days. The process of arbitration shall be decided by the arbitrator in
                                        accordance with the provisions of the Arbitration Act. The cost of arbitration (including all legal
                                        costs) will be borne by the losing Party. Till the continuation of the proceedings and passing of
                                        the award, all the Parties will bear their own share of cost and can recover the same, once the
                                        award is passed, from the losing Party.
                                    </p>

                                    <p className="pb-5">
                                        <b>21. ASSIGNING OF RECEIVABLES:</b> Stayease shall be entitled to assign any receivables under
                                        this Agreement to any third party without any prior notice of intimation to the User.
                                    </p>

                                    <p className="pb-5">
                                        <b>22. STAMP DUTY:</b> Payment of stamp duty or any deficiency in stamp duty on this Agreement
                                        shall be the responsibility of the User.
                                    </p>

                                    <p>
                                        <b>23. CONSEQUENTIAL LOSS:</b> Stayease shall not in any event be liable for special, indirect,
                                        punitive or consequential loss or damage of any kind whatsoever.
                                    </p>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <p className='pb-5'>
                                        <b>24. Other terms and conditions:</b>
                                    </p>

                                    <div className="p-1 border-t border-r border-l border-black border-b-0">
                                        <p className="p-[5px]">Late Payment Fee</p>

                                        <p className="p-[5px]">
                                            If any amounts due under this Agreement are not paid within the due date, the User agrees to pay a
                                            late fee to the Stayease as mentioned below:
                                        </p>

                                        <ol className="px-10 list-decimal">
                                            <li>&nbsp;&nbsp;&nbsp; SLAB-I: Between 6th to 10th day of the month - Rs 100/- per day</li>
                                            <li>&nbsp;&nbsp;&nbsp; SLAB-II: Between 11th to 20th day of the month - Rs 250/- per day</li>
                                            <li>&nbsp;&nbsp;&nbsp; SLAB-III: From the 21st day of the month onwards - Rs 500/- per day</li>
                                        </ol>
                                    </div>

                                    <div className="p-1 border-t border-r border-l border-black border-b-0">
                                        <p className="p-[5px]">Move-out charges</p>

                                        <p className="p-[5px]">
                                            An estimate of the Maintenance Expenses is given below, which will attract a 10% escalation on a
                                            yearly basis for inflation.
                                        </p>

                                        <table className="border-collapse border border-black w-full">
                                            <tbody>
                                                <tr className="border-b border-black">
                                                    <th className="border-r border-black py-1 px-2">Room Type</th>
                                                    <th className="py-1 px-2">Price</th>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">Double Private Rooms</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">Double Sharing Rooms</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">Single Private Rooms</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">1 BHK</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">2 BHK</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                                <tr className="border-b border-black">
                                                    <td className="border-r border-black py-1 px-2">3 BHK</td>
                                                    <td className="py-1 px-2"></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p className='pt-5'>Please note, that in case the actual costs are above the amounts mentioned,
                                            the higher amount would be deducted</p>
                                    </div>

                                    <div className="p-1 border-t-0 border-r border-l border-black border-b">
                                        <p className="p-[5px]">Incidental Charges borne by Stayease</p>

                                        <ol className="px-10 pb-[5px] list-decimal">
                                            <li className="pb-5 ps-[15px]">The above comprises electricity with power back-up including proportionate common area
                                                charges. Utility charges for the room are calculated as per the bills generated by the state
                                                utility board(s) for the building. The unit rates for the said bills shall be at the discretion of the
                                                corresponding state utility board(s).
                                            </li>
                                            <li className="ps-[15px]">Internet Services will be provided except for temporary downtimes
                                                incurred due to third parties & technical difficulties. The scope of Internet services are:
                                                <ul className="list-disc px-10 pb-5">
                                                    <li>The Speed up to 10Mbps/user</li>
                                                    <li>No. of Devices supported is 3 per user</li>
                                                    <li>FUP will be 100GB/Month per user</li>
                                                </ul>
                                            </li>
                                            <li className="ps-[15px]">
                                                The User Subscription agreement will be sent for E- signature on the registered email. The
                                                agreement
                                                will expire after 72 hours or on contract start date whichever is earlier. In case of contract
                                                extensions,property
                                                shifts and room shifts, if the contract request date is less than a month from contract start
                                                date,
                                                the agreement will expire after 24 hours. If an agreement is expired, Rs. 100 inclusive of GST
                                                will
                                                be applicable as an Agreement charge for every resend.
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="p-1 border border-black">
                                        <p className="p-[5px]">House Rules</p>
                                        <ol className="px-10 pb-[5px] list-decimal">
                                            <li className="ps-[15px] pb-5">Premises can be used only for dwelling purpose.</li>
                                            <li className="ps-[15px] pb-5">No damage to the Building or any part of it (including
                                                the
                                                Premises).
                                            </li>
                                            <li className="ps-[15px] pb-5">No rubbish or waste should be stored or burnt/destroyed
                                                in
                                                any part of
                                                the Building.</li>
                                            <li className="ps-[15px] pb-5">Not to litter or cause any kind of annoyance to the
                                                neighbourhood.</li>
                                            <li className="ps-[15px] pb-5">Noise - Keep the noise level within the tolerance of
                                                others
                                                in the
                                                Premises and reduce if requested to do so. No noise shall be caused between 10PM and 6AM which
                                                would
                                                affect the sleeping by any third parties in the Premises/building or nearby building.</li>
                                            <li className="ps-[15px]">Avoid the following
                                                <ul className="list-disc ps-[3rem] pb-5">
                                                    <li>Abusive or foul language</li>
                                                    <li>Harassment in any form to anybody present within the Premises</li>
                                                    <li>Fight/quarrel with the other occupants of the building/instigating the other occupants
                                                        to
                                                        fight
                                                    </li>
                                                    <li>Smoking & use of alcohol except in designated areas.</li>
                                                    <li>Drugs, Explosives & weapons in the whole Premises</li>
                                                    <li>Conducting/carry out any kind of business.</li>
                                                    <li>Alterations to the Premises, any electrical or furnishings of the Premises.</li>
                                                </ul>
                                            </li>

                                            <li className="ps-[15px]">
                                                The User shall not cause any damage to the Premises or Building. In case of any
                                                such damages caused by the User to the Premises or Building, the User shall be liable to pay the
                                                cost of
                                                repairs/replacement due to such damage. If the User fails to pay the cost, Stayease shall deduct
                                                such
                                                cost from the Deposit and claim for the balance cost of the repairs from the User. Stayease
                                                shall
                                                carry
                                                out the repairs of the below items and shall be entitled for reimbursement of
                                                the repairs/replacement cost from the User in the Premises/Building, for the items including but
                                                not
                                                limited to the following:
                                                <ul className="list-disc ps-[3rem] pb-5">
                                                    <li>Any damages/failure to the electrical items;</li>
                                                    <li>Physical damages to the electronics items;</li>
                                                    <li>Physical damages caused to any of the furniture or furnishings;</li>
                                                    <li>Damages to bath fittings;</li>
                                                    <li>Damages to any of the kitchen appliances;</li>
                                                    <li>Repairs/Replacement of any part for any of the above-mentioned appliances;</li>
                                                    <li>Damages to any of the Items (Sports/Gym Equipment, Games, Electronics;</li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="p-1 border border-black">
                                        <ol start="8" className="px-10 pb-[5px] list-decimal">
                                            <li className="ps-[15px] pb-5">
                                                Cleanliness : Kindly keep the Premises clean and tidy and ensure your belongings are kept within
                                                your designated area. Keep the common area clean after you for others to enjoy the common
                                                facilities
                                                of the
                                                Premises.
                                            </li>

                                            <li className="ps-[15px]">
                                                Housekeeping : Housekeeping would be provided to the Sub-Lessee by the Sub-lessor. Further on
                                                request from the User, Stayease may provide a Housekeeping facility subject to availability. The
                                                User shall pay an amount of Rs. 250/- per request. The Housekeeping services will be provided on
                                                Monday to Saturday (a
                                                week) except on public holidays. The scope of Housekeeping shall be as follows:
                                            </li>
                                        </ol>

                                        <ul className="list-disc ps-[6rem] pb-5">
                                            <li>Dishwashing (6 days a week)</li>
                                            <li>Cleaning the bathroom (3 times a week)</li>
                                            <li>Sweeping and mopping the floor in the hall,</li>
                                            <li>Bedroom, kitchenette and balconies (6 days a week)</li>
                                            <li>Clearing the trash (6 days a week)</li>
                                            <li>Windows and Window panes (twice a month)</li>
                                            <li>Dusting the furniture (3 times a week)</li>
                                            <li>Cleaning the fridge (on request)</li>
                                        </ul>

                                        <p className="ps-[3rem] pb-5">
                                            It is clarified that Pet’s cleanliness is not part of the House Keeping.Further on any
                                            additional request from the User, Stayease may provide Housekeeping facility subject to
                                            availability. The User shall pay an amount of Rs. 250/- per request.
                                        </p>

                                        <ol start="10" className="px-10 pb-[5px] list-decimal">
                                            <li className="ps-[15px]">
                                                <p className="pb-[1rem]">
                                                    Pet Policy : If the User occupies the whole Premises, the User shall be entitled to keep
                                                    pets in
                                                    the Premises (not applicable if the Premises is shared with other occupants).
                                                </p>
                                                <p className="pb-[1rem]">
                                                    The User shall keep the pets in the Premises under the condition that the pets shall not be
                                                    allowed in the common areas of the Building or other premises of the Building and no
                                                    littering
                                                    on the common areas of
                                                    the Building, hallways, corridors or any other premises in the Building.
                                                </p>
                                                <p className="pb-[1rem]">
                                                    In the event of breach of any of the condition of Pet Policy, the User shall pay an amount
                                                    of
                                                    Rs.1,000/- as penalty per breach and if the User continues to breach the Pet Policy for more
                                                    than three (3) times,
                                                    Stayease shall be entitled to terminate the Agreement by giving 7 (seven) days prior written
                                                    notice.
                                                </p>
                                                <p className="pb-[1rem]">
                                                    The User shall be responsible for all the acts of the pets and the User shall indemnify
                                                    Stayease
                                                    for any loss or damage that may occur due to the act of the Pets.
                                                </p>
                                                <p className="pb-[1rem]">
                                                    In the event, the User wishes to have his/her pet/s in the Premises, the User shall ensure
                                                    to
                                                    provide a copy of the pet’s medical records.
                                                </p>
                                                <p className="pb-[1rem]">
                                                    Cleaning of the pet inside or outside the Premises is the responsibility of the User
                                                    provided
                                                    the same shall not cause any disturbance to any other occupants.
                                                </p>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="p-1 border border-black">
                                        <ol start="11" className="px-10 pb-[5px] list-decimal">
                                            <li className="ps-[15px] pb-5">
                                                All gatherings, parties or discussions shall be held in the common area with prior permission
                                                from
                                                the manager.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                DTH service is in compliance with TRAI regulations and all channels which are included in the
                                                Network Capacity Fee shall be provided.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                Pest control services will be conducted once every three months of the stay and the amount
                                                charged
                                                for the same is Rs. 300 per room inclusive of GST
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                The User shall raise any concerns/issues/complaints pertaining to the scheduled property on the
                                                mobile application of the User. If the same is not addressed within a reasonable time, the same
                                                shall be escalated to the
                                                community manager.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                In the event of a water scarcity situation arising from the depletion of borewells or the unavailability of water sources, resulting in the necessity of relying on water tankers for water supply, the associated charges shall be distributed equitably among all residents. It is hereby agreed that 50% of the charges shall be borne by the service provider, while the remaining 50% shall be shared equally among all residents residing within the premises. This allocation of charges aims to ensure fairness and mutual responsibility among all parties involved, fostering cooperation and solidarity during challenging circumstances
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                If Users who are of opposite genders and not married stay in the Premises the same shall be at
                                                User’s own risk and the Users shall indemnify Stayease for all the consequences including but
                                                not
                                                limited to any action taken by any third party. In this regard, it is specifically agreed by the
                                                User that in the event
                                                any action is taken by the local authorities/police against the User or the co-occupants, the
                                                User
                                                shall be solely liable for the same to the total exclusion of Stayease
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                <b>Shared Room Belongings Policy:</b> Personal Belongings Placement: In shared rooms, users must keep their personal belongings in the dedicated space provided by the management. If belongings are misplaced or missing, the management will not be held responsible.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                <b>Belongings in Common Areas:</b> Users are permitted to leave their belongings in the common areas, but they do so at their own risk. The management will not be responsible for any loss or damage to items left in these areas.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                <b>Room Cleaning Procedure:</b> Presence of Users: Room cleaning will be conducted in the presence of the users to ensure transparency and security of personal belongings.
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="p-1 border border-black">
                                        <ol start="20" className="px-10 pb-[5px] list-decimal">

                                            <li className="ps-[15px] pb-5">
                                                <b>Cleaning Timing:</b> Cleaning sessions will be scheduled during the following times:<br /><br />
                                                9:00 am to 6 PM  MON - SAT<br /><br />
                                                Users are expected to make necessary arrangements to accommodate these timings. The management will not be responsible for any inconvenience caused during these sessions.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                <b>Room Upgradation Policy</b><br /><br />

                                                Advance Notification: Users interested in upgrading to a larger room must notify the management in advance. This advance notice is necessary to arrange the room and ensure its availability.<br /><br />

                                                Calculation of Rent: The higher rent for the upgraded room will be initiated and calculated from the day the user moves into the upgraded room.<br /><br />

                                                Upfront Payment: An upgraded deposit, along with the revised prepaid rent, will be required to be paid upfront before moving into the upgraded room.<br /><br />

                                                Subject to Availability: Upgradation to a bigger room is subject to availability. In the event that a larger room is not available at the desired time, the resident may need to wait until one becomes available.
                                            </li>

                                            <li className='ps-[15px] pb-5'>
                                                <b>Timing of Requests:</b> Upgradation or downgradiation requests must be made at the beginning of the month and cannot be facilitated in the middle of the month.
                                            </li>

                                            <li className="ps-[15px] pb-5">
                                                <b>Notice Period Policy:</b><br /><br />

                                                <ul className="list-disc ps-[1rem]">
                                                    <li className='pb-5'>
                                                        <b>Timing of Notice Period:</b> Users are required to serve their notice period at the beginning of the month. Notice served in the middle of the month will not be accepted.
                                                    </li>

                                                    <li className='pb-5'>
                                                        <b>Penalty for Mid-Month Notice:</b> If a user requests to serve the notice period in the middle of the month, they will be required to pay the differential amount for the remaining days of the month.
                                                    </li>

                                                    <li className='pb-5'>
                                                        <b>Advance Notice Requirement:</b> Users must provide advance notice as per the terms of the rental agreement before moving out. Failure to do so may result in penalties or forfeiture of deposit.
                                                    </li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="p-1 border border-black">
                                        <ul className="list-disc px-[4rem]">
                                            <li className='pb-5'>
                                                <b>Compliance with Terms:</b> It is the responsibility of the user to comply with the notice period terms outlined in the rental agreement. Any deviations may result in financial consequences.
                                            </li>

                                            <p className='pb-5'>
                                                Please ensure to adhere to the notice period policy to facilitate a smooth transition and avoid any unnecessary financial liabilities.
                                            </p>
                                        </ul>

                                        <ol start="24" className="px-10 pb-[5px] list-decimal">
                                            <li className="ps-[15px]">
                                                <b>Guests Policy:</b>

                                                <div className='pb-[5px] pt-5'>
                                                    <p className="pb-[1rem]">
                                                        The User may accommodate guests for a maximum of 2 days in a month at no additional
                                                        charge. If the guest stay exceeds 2 days in a month, an amount of Rs. 500 (Rupees Five
                                                        Hundred Only) per day per guest shall be charged as a Guest Fee, irrespective of whether
                                                        such guest accommodation is continuous or at intervals in a month.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        Guest accommodation is permitted only for users staying in Double Private rooms. For Single
                                                        Sharing and Double Sharing rooms, guest accommodation is strictly not permitted under any
                                                        circumstances.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        The number of guests allowed to stay in the Premises is limited to 2 persons per day. Such
                                                        admission of the guest(s) shall be subject to permission from other occupants of the same
                                                        Premises in which the User is staying.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        Further, the admission of guest/s by Stayease is subject to availability of rooms. The Guest
                                                        Fee and other conditions mentioned above shall be applicable for a single occupant who is
                                                        sharing the room/taking a portion of the room.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        The User shall ensure that the guests of such User do not disturb other residents of the
                                                        accommodation at any time of their visit/stay and are polite and courteous in their behaviour
                                                        to the residents.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        The Guest Fee is only for accommodation of the guests and excludes meals and beverages
                                                        provided at Stayease which shall be payable on actual consumption basis. It shall be the
                                                        responsibility of the User to keep the management informed about any guests who are staying
                                                        at Stayease.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        An additional charge of Rs. 2000 (Rupees Two Thousand Only) per night per guest shall be
                                                        levied on the User for admitting a guest without receiving prior approval from the management.
                                                        If the User invites guest/s to the Premises, the User shall indemnify Stayease for any of the
                                                        consequences of such stay in the Premises.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        Day visits are restricted only till 8 PM for all guests. Overnight stay must be informed to the
                                                        manager by 8 PM via email to hello@mystayease.com.
                                                    </p>

                                                    <p className="pb-[1rem]">
                                                        The User is fully responsible for the actions of their guests. The guest should not disturb other residents during their stay in the premises.
                                                    </p>
                                                </div>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                        <div className="underline">For User</div>
                                        <div className="underline">For Stayease</div>
                                    </div>
                                </section>

                                <section className="relative p-24 w-[210mm] h-[297mm] border border-gray-400 text-sm">
                                    <div className="px-10">
                                        <div className='pt-5'>
                                            <b className='pb-5'>Declaration:</b> <br />  <br />

                                            <p className='pb-5'>
                                                We, the undersigned, hereby acknowledge that we have carefully read and understood all the terms and conditions outlined in the rental agreement provided by ESTANZIA EASE Private Limited ( StayEase )
                                            </p>

                                            <p className='pb-5'>
                                                As the resident, I agree to abide by these terms throughout the duration of my tenancy. I understand that failure to comply with these terms may result in penalties or forfeiture of deposit. By signing below, I confirm my acceptance of the terms and conditions and agree to adhere to them accordingly.
                                            </p>

                                            <p className='pb-5'>
                                                As the service provider, we “Stayease” , confirm that we have provided the resident, [resident's Full Name], with a copy of the rental agreement containing all terms and conditions applicable to their tenancy. We declare that we have explained the terms to the resident to the best of our ability and ensured that they understand their obligations as outlined in the agreement. By signing below, we affirm our commitment to uphold the terms of the rental agreement and provide the necessary support to the resident throughout their tenancy period.
                                            </p>

                                            <b>
                                                Signatures:
                                            </b>
                                        </div>

                                        <div className="absolute top-[95%] left-[10%] right-[10%] flex justify-between font-bold px-4 text-sm">
                                            <div className="underline">For User</div>
                                            <div className="underline">For Stayease</div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgreementPdf