import { jsPDF, GState } from 'jspdf';
import type { Story, Page } from '@/types';

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

function addWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.08 }));
  doc.setFontSize(48);
  doc.setTextColor(120, 80, 160);
  doc.text('Sofia - Version Gratuita', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45,
  });
  doc.restoreGraphicsState();
}

export async function generateStoryPDF(
  story: Story,
  pages: Page[],
  options?: { watermark?: boolean }
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const showWatermark = options?.watermark ?? false;

  // Cover page
  doc.setFillColor(255, 248, 240);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFontSize(32);
  doc.setTextColor(80, 60, 120);
  doc.text(story.title || 'Mi Cuento', 105, 100, { align: 'center', maxWidth: 170 });

  doc.setFontSize(18);
  doc.setTextColor(120, 100, 160);
  doc.text(`Un cuento para ${story.child_name}`, 105, 140, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(160, 140, 180);
  doc.text('Creado con Sofia', 105, 270, { align: 'center' });

  if (showWatermark) {
    addWatermark(doc);
  }

  // Story pages
  for (const page of pages) {
    doc.addPage();
    doc.setFillColor(255, 252, 248);
    doc.rect(0, 0, 210, 297, 'F');

    // Fetch image from URL and embed in PDF
    if (page.image_url) {
      try {
        const base64 = await fetchImageAsBase64(page.image_url);
        if (base64) {
          doc.addImage(base64, 'PNG', 20, 15, 170, 120);
        }
      } catch {
        // Skip image if it fails
      }
    }

    // Text
    doc.setFontSize(14);
    doc.setTextColor(60, 50, 80);
    const splitText = doc.splitTextToSize(page.text, 170);
    doc.text(splitText, 20, 150);

    // Page number
    doc.setFontSize(10);
    doc.setTextColor(180, 170, 200);
    doc.text(`${page.page_number}`, 105, 285, { align: 'center' });

    if (showWatermark) {
      addWatermark(doc);
    }
  }

  return Buffer.from(doc.output('arraybuffer'));
}
