'use client';

import { useTranslations } from 'next-intl';
import { getToken } from '@/utils/auth/token';
import { Download } from 'lucide-react';
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Image from 'next/image';

interface JamaaDTO {
  id: number;
  nom: string;
}

interface InternalWithPages {
  getNumberOfPages: () => number;
}

const backendUrlGraphQL = process.env.NEXT_PUBLIC_API_GraphQL_URL || '';
const backendUrlRest = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const PrintPage: React.FC = () => {
  const t = useTranslations('print');
  const token = getToken();
  
  const [jamaas, setJamaas] = useState<JamaaDTO[]>([]);
  const [selectedJamaa, setSelectedJamaa] = useState<number>(0);
  const [montakhibs, setMontakhibs] = useState<MontakhibDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch Jamaas on component mount
  useEffect(() => {
    const fetchJamaas = async () => {
      try {
        const res = await fetch(`${backendUrlRest}/jamaas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch Jamaas');
        
        const data: JamaaDTO[] = await res.json();
        setJamaas(data);
        
        if (data.length > 0) {
          setSelectedJamaa(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching Jamaas:', err);
      }
    };

    fetchJamaas();
  }, [token]);

  // Fetch Montakhibs when Jamaa is selected
  useEffect(() => {
    if (selectedJamaa === 0) return;
    
    const fetchMontakhibs = async () => {
      setIsLoading(true);
      try {
        const jamaa = jamaas.find(j => j.id === selectedJamaa);
        if (!jamaa) return;
        
        // GraphQL query to get Montakhibs by Jamaa
        const query = `
          query GetMontakhibByJamaa($jamaa: String!) {
            getMontakhibByJamaa(jamaa: $jamaa) {
              id
              cin
              nom
              prenom
              dateNaissance
              adresse
            }
          }
        `;
        
        const variables = { jamaa: jamaa.nom };
        
        const res = await fetch(backendUrlGraphQL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query, variables }),
        });
        
        if (!res.ok) throw new Error('Failed to fetch Montakhibs');
        
        const { data } = await res.json();
        setMontakhibs(data.getMontakhibByJamaa || []);
      } catch (err) {
        console.error('Error fetching Montakhibs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMontakhibs();
  }, [selectedJamaa, jamaas, token]);

  const handleJamaaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedJamaa(Number(e.target.value));
  };

  const ROWS_PER_PAGE = 18;

    const generatePdf = async () => {
    setIsGenerating(true);
    try {
        const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginY = 10; // Top margin for content
        const footerHeight = 10; // Reserve space for page number

        // Split rows into pages
        const chunks = [];
        for (let i = 0; i < montakhibs.length; i += ROWS_PER_PAGE) {
        chunks.push(montakhibs.slice(i, i + ROWS_PER_PAGE));
        }

        for (let i = 0; i < chunks.length; i++) {
        const pageData = chunks[i];

        // Create temporary DOM
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-9999px';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '794px'; // A4 width in px at 96dpi
        tempDiv.style.minHeight = '1123px'; // A4 height in px at 96dpi
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '20px';
        tempDiv.innerHTML = pdfContentRef.current!.innerHTML;

        const tableBody = tempDiv.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            pageData.forEach((montakhib) => {
            const row = `
                <tr>
                <td class="border border-gray-400 px-3 py-2 text-sm font-medium">${montakhib.id}</td>
                <td class="border border-gray-400 px-3 py-2 text-sm">${montakhib.cin}</td>
                <td class="border border-gray-400 px-3 py-2 text-sm">${montakhib.nom}</td>
                <td class="border border-gray-400 px-3 py-2 text-sm">${montakhib.prenom}</td>
                <td class="border border-gray-400 px-3 py-2 text-sm">${formatDate(montakhib.dateNaissance)}</td>
                <td class="border border-gray-400 px-3 py-2 text-sm">${montakhib.adresse}</td>
                </tr>`;
            tableBody.innerHTML += row;
            });
        }

        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF',
            scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL('image/png');

        // Calculate scaled image size to fit page
        const imgProps = {
            width: canvas.width / 2,
            height: canvas.height / 2,
        };

        const ratio = Math.min(
            pageWidth / imgProps.width,
            (pageHeight - footerHeight) / imgProps.height
        );
        const finalWidth = imgProps.width * ratio;
        const finalHeight = imgProps.height * ratio;
        const marginX = (pageWidth - finalWidth) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(
            imgData,
            'PNG',
            marginX,
            marginY,
            finalWidth,
            finalHeight
        );

        document.body.removeChild(tempDiv);
        }

        // Add page numbers
        const totalPages = pdf.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        const pageNumberText = `Page ${i} / ${totalPages}`;
        pdf.setFontSize(10);
        const textWidth = pdf.getTextWidth(pageNumberText);
        const x = (pageWidth - textWidth) / 2;
        const y = pageHeight - 5;

        pdf.text(pageNumberText, x, y);
        }

        const jamaa = jamaas.find(j => j.id === selectedJamaa);
        const year = new Date().getFullYear();
        pdf.save(`${t('montakhibList')}-${jamaa?.nom || 'jamaa'}-${year}.pdf`);
    } catch (err) {
        console.error('PDF generation failed:', err);
    } finally {
        setIsGenerating(false);
    }
    };


  // Format date from ISO to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR');
  };

  return (
  <div className="container mx-auto py-8">
    <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('selectJamaa')}
            </label>
            <select
              value={selectedJamaa}
              onChange={handleJamaaChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
            >
              {jamaas.map(j => (
                <option key={j.id} value={j.id}>
                  {j.nom}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generatePdf}
              disabled={isGenerating || isLoading || montakhibs.length === 0}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isGenerating || isLoading || montakhibs.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('generating')}
                </span>
              ) : (
                <>
                  <Download size={16} />
                  {t('downloadPdf')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content - Optimized for A4 paper printing */}
      <div 
        ref={pdfContentRef}
        className="bg-white shadow-lg"
        style={{ 
          width: '794px', 
          maxWidth: '100%', 
          minHeight: '1123px', // A4 height
          margin: '0 auto',
          padding: '0',
          fontSize: '12px',
          lineHeight: '1.4'
        }}
      >
        {/* Header - Clean paper-friendly design */}
        <div className="w-full py-6 px-8 border-b-2 border-gray-300" dir='ltr'>
          <div className="flex justify-between items-start">
            {/* French Text Section */}
            <div className="flex-1 text-black">
              <h1 className="text-xl font-bold mb-1">
               Ministère de l'Intérieur , Wilaya de la Région Oriental
              </h1>
              <div className="w-20 h-0.5 bg-black mt-4"></div>
              <h2 className="text-base font-medium text-gray-700">
                Préfecture Oujda Angad
              </h2>
            </div>

            {/* Logo Section */}
            <div className="flex-shrink-0 mx-8">
              <div className="border-2 border-gray-300 rounded-lg p-2">
                <Image 
                  src="/assets/logo.png" 
                  width={95}
                  height={95}
                  className="w-15 h-15 object-contain"
                  alt="Logo of Wilaya Oriental"
                />
              </div>
            </div>

            {/* Arabic Text Section */}
            <div className="flex-1 text-right text-black" dir="rtl">
              <h1 className="text-xl font-bold mb-1">
                وزارة الداخلية, ولاية جهة الشرق
              </h1>
              <div className="w-20 h-0.5 bg-black mt-4 ml-auto"></div>
              <h2 className="text-base font-medium text-gray-700">
                عمالة وجدة أنجاد
              </h2>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="py-6 px-8 text-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black mb-3">{t('title')}</h1>
          <div className="flex justify-center items-center gap-8 text-base">
            <div className="font-medium text-gray-800">
              {t('year')}: <span className="font-bold">{new Date().getFullYear()}</span>
            </div>
            <div className="font-medium text-gray-800">
              {t('jamaa')}: <span className="font-bold">{jamaas.find(j => j.id === selectedJamaa)?.nom || ''}</span>
            </div>
          </div>
        </div>

        {/* Data Table - Optimized for paper printing */}
        <div className="px-8 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('id')}
                </th>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('cin')}
                </th>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('nom')}
                </th>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('prenom')}
                </th>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('birthDate')}
                </th>
                <th className="border-2 border-black bg-gray-100 px-3 py-3 text-left rtl:text-right text-sm font-bold">
                  {t('address')}
                </th>
              </tr>
            </thead>
            <tbody>
              {montakhibs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border-2 border-black px-3 py-8 text-center text-gray-600 text-base font-medium">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                montakhibs.map((montakhib, index) => (
                  <tr key={montakhib.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-400 px-3 py-2 text-sm font-medium">
                      {montakhib.id}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {montakhib.cin}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {montakhib.nom}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {montakhib.prenom}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {formatDate(montakhib.dateNaissance)}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {montakhib.adresse}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - Professional paper footer */}
        <div className="px-8 py-4 border-t-2 border-gray-300 mt-8">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <div className="font-medium">
              {t('printDate')}: {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="font-medium">
              {t('totalRecords')}: {montakhibs.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default PrintPage;