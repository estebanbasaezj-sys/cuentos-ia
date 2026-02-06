import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import type { Story, Page } from '@/types';

export async function generateStoryPDF(story: Story, pages: Page[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

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
  doc.text('Creado con Cuentos IA', 105, 270, { align: 'center' });

  // Story pages
  for (const page of pages) {
    doc.addPage();
    doc.setFillColor(255, 252, 248);
    doc.rect(0, 0, 210, 297, 'F');

    // Try to add image
    if (page.image_url) {
      try {
        const imgPath = path.join(process.cwd(), 'public', page.image_url);
        if (fs.existsSync(imgPath)) {
          const imgData = fs.readFileSync(imgPath);
          const base64 = `data:image/png;base64,${imgData.toString('base64')}`;
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
  }

  return Buffer.from(doc.output('arraybuffer'));
}
