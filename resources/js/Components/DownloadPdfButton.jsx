import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DownloadPdfButton = ({ 
    contentRef, 
    fileName = 'download',
    buttonText = 'Download as PDF',
    documentTitle = 'Smart Farming Document',
    paperFormat = 'a4',
    className = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors'
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = async () => {
        if (!contentRef.current) return;
        
        setIsGenerating(true);
        
        try {
            const contentElement = contentRef.current;
            const canvas = await html2canvas(contentElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Enable CORS for images
                logging: false,
                allowTaint: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p', // Landscape or portrait
                unit: 'mm',
                format: paperFormat
            });
            
            // Calculate dimensions to fit content properly
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add title
            pdf.setFontSize(16);
            pdf.text(documentTitle, pdf.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
            
            // Add timestamp
            pdf.setFontSize(8);
            pdf.text(
                `Generated on ${new Date().toLocaleString()}`, 
                pdf.internal.pageSize.getWidth() - 10, 
                10, 
                { align: 'right' }
            );
            
            // Add content image
            pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.text(
                'Created using Smart Farming System', 
                pdf.internal.pageSize.getWidth() / 2, 
                pdf.internal.pageSize.getHeight() - 5, 
                { align: 'center' }
            );
            
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={generatePdf}
            disabled={isGenerating}
            className={`${className} ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isGenerating ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </span>
            ) : buttonText}
        </button>
    );
};

export default DownloadPdfButton;