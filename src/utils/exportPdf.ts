import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportPdfOptions {
  filename?: string;
  onProgress?: (current: number, total: number, statusText: string) => void;
}

/**
 * Exports all .a4-page elements rendered in the document into a high-quality multi-page A4 PDF.
 * Uses html2canvas-pro to support modern CSS (oklch, color-mix, lab) and high DPI rendering.
 */
export async function exportTableToPdf(options: ExportPdfOptions = {}): Promise<void> {
  const {
    filename = '상지여자중학교_연수등록부.pdf',
    onProgress,
  } = options;

  onProgress?.(0, 1, '등록부 서식 확인 중...');

  // 1. Find all A4 page elements in the DOM with retry mechanism
  let pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-page'));

  if (pageElements.length === 0) {
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-page'));
      if (pageElements.length > 0) break;
    }
  }

  if (!pageElements || pageElements.length === 0) {
    throw new Error('인쇄할 등록부 서식(A4 페이지)을 화면에서 찾을 수 없습니다. [등록부 서식 확인] 탭을 확인해 주세요.');
  }

  const totalPages = pageElements.length;
  onProgress?.(0, totalPages, 'A4 규격 PDF 준비 중...');

  // 2. Initialize jsPDF in portrait A4 (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // 3. Render each page using html2canvas-pro
  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageElements[i];
    onProgress?.(i + 1, totalPages, `${i + 1} / ${totalPages} 페이지 고해상도 변환 중...`);

    // Extract live input values specifically for this page (avoid global document query index offsets)
    const pageInputs = Array.from(pageEl.querySelectorAll<HTMLInputElement>('input'));
    pageInputs.forEach((inp, idx) => {
      inp.setAttribute('data-pdf-idx', String(idx));
      inp.setAttribute('data-pdf-val', inp.value ?? '');
      inp.setAttribute('value', inp.value ?? '');
    });

    const pageTextareas = Array.from(pageEl.querySelectorAll<HTMLTextAreaElement>('textarea'));
    pageTextareas.forEach((ta, idx) => {
      ta.setAttribute('data-pdf-idx', String(idx));
      ta.setAttribute('data-pdf-val', ta.value ?? '');
      ta.textContent = ta.value ?? '';
    });

    pageEl.setAttribute('data-pdf-current-page', 'true');

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(pageEl, {
        scale: 2, // 2x resolution for crisp high-DPI PDF output
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Ignore buttons, toolbar hints or elements marked no-print
          return (
            element.classList.contains('no-print') ||
            element.classList.contains('print:hidden')
          );
        },
        onclone: (clonedDoc) => {
          // Find the specific page being cloned
          const clonedPage =
            clonedDoc.querySelector<HTMLElement>('[data-pdf-current-page="true"]') ||
            clonedDoc.querySelectorAll<HTMLElement>('.a4-page')[i];

          if (!clonedPage) return;

          // Remove screen card borders and drop shadows in cloned document; apply standardized margins
          clonedPage.style.boxShadow = 'none';
          clonedPage.style.border = 'none';
          clonedPage.style.margin = '0';
          clonedPage.style.paddingTop = '15mm';
          clonedPage.style.paddingLeft = '15mm';
          clonedPage.style.paddingRight = '15mm';
          clonedPage.style.paddingBottom = '10mm';

          // Hide all no-print elements in the cloned page
          const noPrintElements = clonedPage.querySelectorAll<HTMLElement>('.no-print, .print\\:hidden');
          noPrintElements.forEach((el) => {
            el.style.display = 'none';
          });

          // Replace text inputs with static divs for crisp font rendering using exact scoped values
          const clonedInputs = Array.from(clonedPage.querySelectorAll<HTMLInputElement>('input'));
          clonedInputs.forEach((input) => {
            const idxStr = input.getAttribute('data-pdf-idx');
            const idx = idxStr !== null ? parseInt(idxStr, 10) : -1;
            const val =
              (idx >= 0 && pageInputs[idx] ? pageInputs[idx].value : null) ??
              input.getAttribute('data-pdf-val') ??
              input.getAttribute('value') ??
              input.value ??
              '';

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
            span.style.overflow = 'hidden';
            span.style.wordBreak = 'break-all';

            if (input.classList.contains('text-center') || input.parentElement?.classList.contains('text-center')) {
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

          // Replace textareas with static divs
          const clonedTextareas = Array.from(clonedPage.querySelectorAll<HTMLTextAreaElement>('textarea'));
          clonedTextareas.forEach((textarea) => {
            const idxStr = textarea.getAttribute('data-pdf-idx');
            const idx = idxStr !== null ? parseInt(idxStr, 10) : -1;
            const val =
              (idx >= 0 && pageTextareas[idx] ? pageTextareas[idx].value : null) ??
              textarea.getAttribute('data-pdf-val') ??
              textarea.value ??
              '';

            const div = clonedDoc.createElement('div');
            div.textContent = val;
            div.className = textarea.className;
            div.style.cssText = textarea.style.cssText;
            div.style.whiteSpace = 'pre-wrap';
            textarea.parentNode?.replaceChild(div, textarea);
          });
        },
      });
    } catch (pageRenderErr) {
      console.error(`Page ${i + 1} rendering error:`, pageRenderErr);
      throw new Error(`${i + 1}페이지 그래픽 렌더링 중 오류가 발생했습니다: ${pageRenderErr instanceof Error ? pageRenderErr.message : String(pageRenderErr)}`);
    } finally {
      // Clean up temporary attributes from live DOM
      pageInputs.forEach((inp) => {
        inp.removeAttribute('data-pdf-idx');
        inp.removeAttribute('data-pdf-val');
      });
      pageTextareas.forEach((ta) => {
        ta.removeAttribute('data-pdf-idx');
        ta.removeAttribute('data-pdf-val');
      });
      pageEl.removeAttribute('data-pdf-current-page');
    }

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

  // 4. Save PDF file with iframe-safe fallback
  try {
    pdf.save(filename);
  } catch (saveErr) {
    console.warn('Direct pdf.save failed, using blob download fallback:', saveErr);
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  }
}
