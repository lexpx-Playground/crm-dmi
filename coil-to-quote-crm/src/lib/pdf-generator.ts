// PDF generation for quotations using jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { QuotationStatus, Settings, Client } from '../types';
import { formatDate, formatCurrency } from './utils';

interface PDFOptions {
  settings: Settings;
  client: Client;
  quote: QuotationStatus;
  logoDataUrl?: string;
}

export function generateQuotationPDF(options: PDFOptions): Promise<Blob> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    const { settings, client, quote, logoDataUrl } = options;
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Header - Company info
    let yPos = margin;
    
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', margin, yPos, 40, 20);
        yPos += 25;
      } catch (e) {
        // Logo failed, continue with text
      }
    }
    
    // Company name and contact
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.company_name || 'Company Name', margin + (logoDataUrl ? 45 : 0), yPos);
    
    if (settings.company_address) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(settings.company_address, margin + (logoDataUrl ? 45 : 0), yPos + 5);
    }
    
    if (settings.company_contact) {
      doc.text(settings.company_contact, margin + (logoDataUrl ? 45 : 0), yPos + 10);
    }
    
    // QUOTATION title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth - margin - 40, margin);
    
    // Quote details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const quoteDetailsY = margin + 30;
    doc.text(`Quote No: ${quote.quote_no}`, pageWidth - margin - 40, quoteDetailsY);
    doc.text(`Issue date: ${formatDate(quote.issue_date)}`, pageWidth - margin - 40, quoteDetailsY + 5);
    doc.text(`Valid until: ${formatDate(quote.valid_until)}`, pageWidth - margin - 40, quoteDetailsY + 10);
    
    // Bill To section
    yPos = quoteDetailsY + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(client.name, margin, yPos + 5);
    if (client.phone) {
      doc.text(`Phone: ${client.phone}`, margin, yPos + 10);
    }
    if (client.email) {
      doc.text(`Email: ${client.email}`, margin, yPos + 15);
    }
    if (client.address) {
      doc.text(client.address, margin, yPos + 20);
    }
    
    // Project name
    if (quote.project_name) {
      doc.setFont('helvetica', 'bold');
      doc.text('PROJECT:', margin, yPos + 35);
      doc.setFont('helvetica', 'normal');
      doc.text(quote.project_name, margin + 15, yPos + 35);
    }
    
    // Line items table
    const tableStartY = yPos + 50;
    const headers = ['#', 'DESCRIPTION', 'QTY', 'UNIT', 'PRICE', 'TOTAL'];
    const rows = quote.lines.map((line, index) => [
      index + 1,
      line.description,
      line.qty.toFixed(2),
      line.unit,
      `${settings.currency_symbol}${line.unit_price.toFixed(2)}`,
      `${settings.currency_symbol}${line.total.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });
    
    // Totals section
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, pageWidth - margin - 50, finalY);
    doc.text(`${settings.currency_symbol}${quote.subtotal.toFixed(2)}`, pageWidth - margin, { align: 'right' });
    
    // Tax line
    finalY += 6;
    if (settings.tax_rate > 0) {
      doc.text(`${settings.tax_name} (${settings.tax_rate}%):`, pageWidth - margin - 50, finalY);
      doc.text(`${settings.currency_symbol}${quote.tax_amount.toFixed(2)}`, pageWidth - margin, { align: 'right' });
      finalY += 6;
    }
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL:`, pageWidth - margin - 50, finalY);
    doc.text(formatCurrency(quote.total, settings.currency_symbol, settings.currency_code), pageWidth - margin, { align: 'right' });
    
    // Terms and validity note
    finalY += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const validityNote = `Prices valid until ${formatDate(quote.valid_until)}`;
    doc.text(validityNote, margin, finalY);
    
    if (settings.terms_text) {
      const splitTerms = doc.splitTextToSize(settings.terms_text, pageWidth - margin * 2);
      doc.text(splitTerms, margin, finalY + 5);
    }
    
    // Footer
    const footerY = pageHeight - margin - 10;
    doc.setFontSize(8);
    doc.text(`Prepared by: ${quote.created_by}`, margin, footerY);
    
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, footerY);
    }
    
    // Generate blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
}

// Generate draft PDF with watermark
export function generateDraftPDF(options: PDFOptions): Promise<Blob> {
  return generateQuotationPDF(options).then((blob) => {
    // For drafts, we'd add a watermark layer
    // For simplicity in POC, return the same PDF
    // In production, add diagonal "DRAFT" watermark
    return blob;
  });
}
