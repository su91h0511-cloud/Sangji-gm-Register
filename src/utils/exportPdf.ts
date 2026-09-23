import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  filename?: string;
  onProgress?: (current: number, total: number, statusText: string) => void;
}

/**
 * Exports all .a4-page elements rendered in the document into a high-quality multi-page A4 PDF.
 */
export async function exportTableToPdf(options: ExportPdfOptions = {}): Promise<void> {
  const {
    filename = '상지여자중학교_연수등록부.pdf',
    onProgress,
  } = options;

  // 1. Find all A4 page elements in the DOM
  const pageElements = document.querySelectorAll<HTMLElement>('.a4-page');

  if (!pageElements || pageElements.length === 0) {
    throw new Error('인쇄할 등록부 페이지를 찾을 수 없습니다.');
  }

  const totalPages = pageElements.length;
  onProgress?.(0, totalPages, 'PDF 문서 준비 중...');

  // 2. Initialize jsPDF in portrait A4 (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // 3. Render each page using html2canvas
  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageElements[i];
    onProgress?.(i + 1, totalPages, `${i + 1} / ${totalPages} 페이지 변환 중...`);

    // Use html2canvas with optimized options
    const canvas = await html2canvas(pageEl, {
      scale: 2, // 2x resolution for crisp high-DPI PDF output
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      ignoreElements: (element) => {
        // Ignore buttons or administrative controls meant only for editing
        return element.classList.contains('no-print');
      },
      onclone: (clonedDoc) => {
        // Remove screen card borders and drop shadows in cloned document
        const clonedPages = clonedDoc.querySelectorAll<HTMLElement>('.a4-page');
        clonedPages.forEach((p) => {
          p.style.boxShadow = 'none';
          p.style.border = 'none';
          p.style.margin = '0';
          p.style.padding = '32px 36px';
        });

        // Hide all no-print elements in the cloned DOM
        const noPrintElements = clonedDoc.querySelectorAll<HTMLElement>('.no-print');
        noPrintElements.forEach((el) => {
          el.style.display = 'none';
        });

        // Ensure all inputs in the clone show their current values cleanly as text
        const inputs = clonedDoc.querySelectorAll<HTMLInputElement>('input[type="text"], input:not([type])');
        inputs.forEach((input) => {
          const val = input.value || '';
          const span = clonedDoc.createElement('div');
          span.textContent = val;
          span.className = input.className;
          span.style.cssText = input.style.cssText;
          span.style.display = 'flex';
          span.style.alignItems = 'center';
          span.style.minHeight = '100%';
          span.style.width = '100%';
          span.style.border = 'none';
          span.style.background = 'transparent';
          
          if (input.classList.contains('text-center')) {
            span.style.justifyContent = 'center';
            span.style.textAlign = 'center';
          } else if (input.classList.contains('text-right')) {
            span.style.justifyContent = 'flex-end';
            span.style.textAlign = 'right';
          } else {
            span.style.justifyContent = 'flex-start';
            span.style.textAlign = 'left';
          }

          input.parentNode?.replaceChild(span, input);
        });

        // Textarea handling
        const textareas = clonedDoc.querySelectorAll<HTMLTextAreaElement>('textarea');
        textareas.forEach((textarea) => {
          const div = clonedDoc.createElement('div');
          div.textContent = textarea.value || '';
          div.className = textarea.className;
          div.style.cssText = textarea.style.cssText;
          div.style.whiteSpace = 'pre-wrap';
          textarea.parentNode?.replaceChild(div, textarea);
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgProps = pdf.getImageProperties(imgData);
    const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let renderWidth = pdfWidth;
    let renderHeight = calculatedHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (calculatedHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = (imgProps.width * pdfHeight) / imgProps.height;
      offsetX = (pdfWidth - renderWidth) / 2;
    } else {
      offsetY = 0;
    }

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
  }

  onProgress?.(totalPages, totalPages, 'PDF 파일 저장 중...');
  pdf.save(filename);
}
