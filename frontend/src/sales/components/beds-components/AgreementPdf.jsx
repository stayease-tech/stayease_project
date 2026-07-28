import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { DashPage } from '../../../shared/Dashboard';
import AgreementPdfDocument from './AgreementPdfDocument';

function AgreementPdf() {
  const navigate = useNavigate();
  const location = useLocation();
  const bedsData = location.state?.bedsData || [];
  const bedData = location.state?.bedData || {};
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <AgreementPdfDocument data={bedData} bedsData={bedsData} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bedData?.resident_data?.residentsName?.replace(/\s+/g, '') || 'Contract'}_Contract.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashPage>
      <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">
        AGREEMENT
      </h1>

      <div className="sm:flex justify-between">
        <button
          className="block max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
          onClick={() => navigate('/sales/sales-beds-table')}
          type="button"
        >
          Prev
        </button>

        <button
          className="block mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm max-sm:w-full"
          onClick={generatePDF}
          disabled={isGenerating}
          type="button"
        >
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </DashPage>
  );
}

export default AgreementPdf;
