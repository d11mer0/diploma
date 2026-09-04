import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GeneratePdfOptions {
  filename?: string;
  reportTitle?: string;
}

/**
 * Генерує офіційний PDF-звіт стандарту A4 із HTML-елемента
 * @param elementId ID DOM-елемента, який містить шаблон звіту
 * @param options Налаштування імені файлу та заголовка
 */
export const generateAccreditationPdf = async (
  elementId: string,
  options: GeneratePdfOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Елемент з id "${elementId}" не знайдено для експорту в PDF.`);
  }

  // Тимчасово показуємо елемент, якщо він був схований поза межами екрана
  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    // Рендеримо HTML у Canvas з масштабом 2 для високої чіткості (300 DPI)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginX = 10;
    const marginTop = 10;
    const marginBottom = 15;
    const printableWidth = pageWidth - marginX * 2; // 190 мм
    const printableHeight = pageHeight - marginTop - marginBottom; // 272 мм

    // Розрахунок розмірів у пікселях canvas
    const canvasPrintableHeightPx = (canvas.width * printableHeight) / printableWidth;
    const totalPages = Math.max(1, Math.ceil(canvas.height / canvasPrintableHeightPx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const sourceY = page * canvasPrintableHeightPx;
      const sourceHeight = Math.min(canvasPrintableHeightPx, canvas.height - sourceY);

      // Створюємо тимчасовий canvas для зрізу однієї сторінки
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const renderedHeightMm = (sourceHeight * printableWidth) / canvas.width;

        pdf.addImage(
          pageImgData,
          'JPEG',
          marginX,
          marginTop,
          printableWidth,
          renderedHeightMm
        );
      }


    }

    const sanitizedFilename = (options.filename || 'E-CF_Accreditation_Report')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();

    pdf.save(`${sanitizedFilename}.pdf`);
  } finally {
    element.style.display = originalDisplay;
  }
};
