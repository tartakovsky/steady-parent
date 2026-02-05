/**
 * Capture a DOM element and save it as a PDF.
 * Uses html-to-image for the screenshot and jsPDF for the document.
 */
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export async function savePdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Capture at 2x for retina-quality output
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Scale image to fit page width
  const ratio = img.height / img.width;
  const contentHeight = contentWidth * ratio;

  // Use portrait A4; if content is taller than one page, extend the page
  const pdfHeight = Math.max(pageHeight, contentHeight + margin * 2);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pageWidth, pdfHeight],
  });

  doc.addImage(dataUrl, "PNG", margin, margin, contentWidth, contentHeight);
  doc.save(filename);
}
