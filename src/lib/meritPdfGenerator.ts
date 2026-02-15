'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MeritProgram {
  discipline: string;
  school: string;
  meritPosition: number;
  aggregate: number;
}

export interface MeritListPage {
  listNumber: string;
  programs: MeritProgram[];
}

// ── Color palette (matches website teal-green theme) ──
const PRIMARY: [number, number, number] = [55, 122, 120];   // #377a78
const DARK: [number, number, number] = [15, 31, 31];        // #0f1f1f
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY: [number, number, number] = [120, 120, 120];
const ALT_ROW: [number, number, number] = [240, 247, 247];  // very light teal
const BORDER_LINE: [number, number, number] = [190, 215, 214];
const PROMO_GREEN: [number, number, number] = [34, 100, 98]; // darker teal for promo

/**
 * Draw a very subtle watermark BEFORE content is drawn.
 * Uses GState for true transparency so text on top stays fully readable.
 */
function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gState = new (doc as any).GState({ opacity: 0.035 });
  doc.setGState(gState);
  doc.setFontSize(80);
  doc.setTextColor(55, 122, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('HORIZON PREP', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 35,
  });
  doc.restoreGraphicsState();
}

/**
 * Draw page border and footer on every page.
 */
function addPageDecorations(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
) {
  // ── Double border ──
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.8);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
  doc.setLineWidth(0.25);
  doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

  // ── Footer section ──
  const footerY = pageHeight - 19;

  // Thin separator above footer
  doc.setDrawColor(...BORDER_LINE);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // ── WhatsApp / Phone (left) ──
  doc.setFontSize(7.5);
  doc.setTextColor(...PROMO_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('\u260E  +92 328 5297016', margin + 2, footerY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text('horizonprep.com', margin + 2, footerY + 9);

  // ── Center footer text ──
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Prepared & Compiled by Horizon Prep  \u2022  For Academic Guidance Only',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' },
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    pageWidth / 2,
    footerY + 9,
    { align: 'center' },
  );
}

/**
 * Fetch the Horizon Prep logo as a base64 data URL.
 */
async function fetchLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch('/horizon-logo.jpeg');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Draw header block with academy branding, promo tagline, and merit list title.
 * Returns the Y position after the header to start the table.
 */
function addHeader(
  doc: jsPDF,
  meritList: MeritListPage,
  year: number,
  pageWidth: number,
  margin: number,
  logoBase64: string | null,
): number {
  // ── Top accent bar ──
  doc.setFillColor(...PRIMARY);
  doc.rect(9.5, 9.5, pageWidth - 19, 3.5, 'F');

  // ── Logo (top-right corner) ──
  if (logoBase64) {
    const logoSize = 18;
    doc.addImage(logoBase64, 'JPEG', pageWidth - margin - logoSize - 2, 15, logoSize, logoSize);
  }

  let y = 21;

  // ── Academy Name ──
  doc.setFontSize(26);
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text('Horizon Prep', pageWidth / 2, y, { align: 'center' });

  // ── Promotional tagline ──
  y += 7.5;
  doc.setFontSize(8.5);
  doc.setTextColor(...PROMO_GREEN);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Get FREE Sample Papers & Expert Guidance  |  Our Students Consistently Score 150+ in NET',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  // ── Contact line ──
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    '\u260E +92 328 5297016   |   horizonprep.com',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  // ── Thin separator ──
  y += 3.5;
  doc.setDrawColor(...BORDER_LINE);
  doc.setLineWidth(0.3);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  // ── Main Title ──
  y += 7.5;
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(`NUST Admission Merit History ${year}`, pageWidth / 2, y, {
    align: 'center',
  });

  // ── Category line ──
  y += 6;
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Engineering  \u2022  Computing  \u2022  Applied Sciences  \u2022  Business  \u2022  Social Sciences',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  // ── Source note ──
  y += 4.5;
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    'Source: NUST Admissions Directorate (Compiled for student guidance)',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  // ── Strong separator ──
  y += 3.5;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);

  // ── Merit List sub-header ──
  y += 8;
  const listLabel =
    meritList.listNumber === 'Final'
      ? 'Final Merit List'
      : `Merit List \u2013 ${meritList.listNumber}`;
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(listLabel, pageWidth / 2, y, { align: 'center' });

  y += 5;
  return y;
}

/**
 * Generate a professional multi-page PDF with selected NUST merit list data.
 */
export async function generateMeritHistoryPDF(
  data: MeritListPage[],
  year: number = 2025,
): Promise<void> {
  if (!data || data.length === 0) return;

  // Fetch logo once before generating pages
  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  data.forEach((meritList, listIndex) => {
    if (listIndex > 0) doc.addPage();

    // Draw watermark FIRST so it sits behind all content
    drawWatermark(doc, pageWidth, pageHeight);

    // Header + sub-header (drawn ON TOP of watermark)
    const tableStartY = addHeader(doc, meritList, year, pageWidth, margin, logoBase64);

    // Build table rows
    const tableBody = meritList.programs.map((p, i) => [
      (i + 1).toString(),
      p.discipline,
      p.school,
      p.meritPosition.toLocaleString(),
      p.aggregate > 0 ? p.aggregate.toFixed(2) + '%' : 'N/A',
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['#', 'Discipline / Program', 'School', 'Closing Position', 'Aggregate']],
      body: tableBody,
      margin: { left: margin, right: margin, bottom: 26 },
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
        lineColor: BORDER_LINE,
        lineWidth: 0.2,
        textColor: DARK,
        font: 'helvetica',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      },
      alternateRowStyles: {
        fillColor: ALT_ROW,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 68 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 35 },
        4: { halign: 'center', cellWidth: 28 },
      },
      didDrawPage: () => {
        addPageDecorations(doc, pageWidth, pageHeight, margin);
      },
    });
  });

  // ── Page numbers ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 2,
      pageHeight - 10,
      { align: 'right' },
    );
  }

  // ── Filename ──
  const listNames = data.map((d) => d.listNumber).join('_');
  doc.save(`NUST_Merit_History_${year}_List_${listNames}_Horizon_Prep.pdf`);
}
