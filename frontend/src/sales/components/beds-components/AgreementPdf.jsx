// src/operations/components/beds-components/AgreementPdf.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { DashPage } from '../../../shared/Dashboard';
import AgreementPdfDocument from './AgreementPdfDocument';

function AgreementPdf() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<AgreementPdfDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test_contract.pdf';
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
      <h1 className="text-center text-2xl font-semibold mb-8 text-[#D4A017]">
        AGREEMENT
      </h1>

      <div className="sm:flex justify-between">
        <button
          className="block mb-5 px-4 py-2 bg-[#D4A017] text-white rounded cursor-pointer"
          onClick={() => navigate('/sales/sales-beds-table')}
          type="button"
        >
          Prev
        </button>

        <button
          className="block mb-5 px-4 py-2 bg-[#D4A017] text-white rounded cursor-pointer"
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
