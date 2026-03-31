import { Injectable } from '@angular/core';
import { GroupPolicy } from '../../shared/models';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class PolicyCertificateService {

  async generateCertificate(policy: GroupPolicy): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();   // 210mm
    const ph = doc.internal.pageSize.getHeight();  // 297mm

    // ── COLOUR PALETTE ──────────────────────────────────────────────────────
    const navy   = [27,  42,  74]  as [number, number, number];
    const blue   = [43, 116, 226]  as [number, number, number];
    const gold   = [200, 169, 81]  as [number, number, number];
    const white  = [255, 255, 255] as [number, number, number];
    const light  = [248, 246, 241] as [number, number, number];
    const muted  = [90,  106, 126] as [number, number, number];
    const green  = [5,  150,  105] as [number, number, number];

    // ── BACKGROUND ──────────────────────────────────────────────────────────
    doc.setFillColor(...light);
    doc.rect(0, 0, pw, ph, 'F');

    // ── HEADER BAND ─────────────────────────────────────────────────────────
    doc.setFillColor(...navy);
    doc.rect(0, 0, pw, 48, 'F');

    // Gold accent stripe
    doc.setFillColor(...gold);
    doc.rect(0, 46, pw, 3, 'F');

    // ── LOGO (scaled small + JPEG to keep file size tiny) ───────────────────
    try {
      const logoDataUrl = await this.loadLogoAsDataUrl();
      doc.addImage(logoDataUrl, 'JPEG', 12, 6, 22, 22);
    } catch {
      // Fallback: draw a coloured box with initials
      doc.setFillColor(...blue);
      doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
      doc.setTextColor(...gold);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SH', 22, 20, { align: 'center' });
    }

    // Company name
    doc.setTextColor(...white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SureHealth', 38, 17);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 200, 230);
    doc.text('Corporate Health Insurance Platform', 38, 24);

    // Certificate title (right side)
    doc.setTextColor(...gold);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('POLICY CERTIFICATE', pw - 14, 17, { align: 'right' });

    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Document', pw - 14, 24, { align: 'right' });

    // Policy number badge
    doc.setFillColor(...blue);
    doc.roundedRect(pw - 14 - 52, 30, 52, 10, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`# ${policy.policyNumber || 'N/A'}`, pw - 14 - 26, 36.5, { align: 'center' });

    // ── STATUS BADGE ────────────────────────────────────────────────────────
    const isApproved = policy.status === 'APPROVED';
    doc.setFillColor(...(isApproved ? green : [220, 38, 38] as [number,number,number]));
    doc.roundedRect(14, 53, 28, 8, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    // Use ASCII-safe characters (Helvetica doesn't support Unicode symbols)
    doc.text(isApproved ? 'ACTIVE' : 'INACTIVE', 28, 58.2, { align: 'center' });

    // Issued date
    doc.setTextColor(...muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Issued: ${today}`, pw - 14, 58, { align: 'right' });

    // ── SECTION DIVIDER LABEL ───────────────────────────────────────────────
    const sectionLabel = (text: string, y: number) => {
      doc.setFillColor(...blue);
      doc.rect(14, y, 3, 6, 'F');
      doc.setTextColor(...navy);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(text, 20, y + 5);
    };

    // ── COMPANY INFORMATION ─────────────────────────────────────────────────
    sectionLabel('Company Information', 70);
    this.drawInfoCard(doc, 14, 80, pw - 28, 36, [
      ['Company Name',     policy.corporateClient?.companyName     || 'N/A'],
      ['Registration No.', policy.corporateClient?.registrationNumber || 'N/A'],
      ['Contact Person',   policy.corporateClient?.contactPerson   || 'N/A'],
      ['Contact Email',    policy.corporateClient?.contactEmail    || 'N/A'],
      ['Industry',         policy.corporateClient?.industryType    || 'General'],
      ['Total Employees',  String(policy.corporateClient?.numberOfEmployees || 'N/A')],
    ], navy, muted, white, light);

    // ── PLAN DETAILS ────────────────────────────────────────────────────────
    sectionLabel('Insurance Plan Details', 122);
    this.drawInfoCard(doc, 14, 132, pw - 28, 36, [
      ['Plan Name',          policy.insurancePlan?.planName || 'N/A'],
      ['Coverage Amount',    `Rs. ${(policy.insurancePlan?.coverageAmount || 0).toLocaleString('en-IN')}`],
      ['Premium / Employee', `Rs. ${(policy.customPremiumPerEmployee || policy.insurancePlan?.premiumPerEmployee || 0).toLocaleString('en-IN')} / year`],
      ['Duration',           `${policy.insurancePlan?.durationMonths || 'N/A'} months`],
      ['Waiting Period',     `${policy.insurancePlan?.waitingPeriodDays || 0} days`],
      ['Billing Cycle',      policy.billingCycle || 'N/A'],
    ], navy, muted, white, light);

    // ── COVERAGE PERIOD ──────────────────────────────────────────────────────
    sectionLabel('Coverage Period', 174);

    // Start date box
    doc.setFillColor(...white);
    doc.roundedRect(14, 183, 55, 22, 3, 3, 'F');
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 183, 55, 22, 3, 3, 'S');
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('START DATE', 41, 189, { align: 'center' });
    doc.setTextColor(...navy);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(this.fmt(policy.startDate), 41, 200, { align: 'center' });

    // Divider line instead of arrow (ASCII-safe)
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.8);
    doc.line(72, 194, 105, 194);
    doc.setFillColor(...blue);
    doc.triangle(105, 190, 105, 198, 110, 194, 'F');

    // End date box
    doc.setFillColor(...white);
    doc.roundedRect(pw - 69, 183, 55, 22, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.roundedRect(pw - 69, 183, 55, 22, 3, 3, 'S');
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('END DATE', pw - 69 + 27, 189, { align: 'center' });
    doc.setTextColor(...navy);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(this.fmt(policy.endDate), pw - 69 + 27, 200, { align: 'center' });

    // ── PREMIUM SUMMARY HIGHLIGHT ────────────────────────────────────────────
    doc.setFillColor(...navy);
    doc.roundedRect(14, 212, pw - 28, 22, 4, 4, 'F');
    doc.setFillColor(...gold);
    doc.roundedRect(14, 212, 4, 22, 2, 2, 'F');

    doc.setTextColor(180, 200, 230);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Annual Premium (per employee)', 24, 220);

    const premium = policy.customPremiumPerEmployee || policy.insurancePlan?.premiumPerEmployee || 0;
    doc.setTextColor(...gold);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    // Use Rs. instead of Rs symbol - Helvetica cannot render Unicode Rs symbol
    doc.text(`Rs. ${premium.toLocaleString('en-IN')}`, 24, 230);

    doc.setTextColor(180, 200, 230);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('per employee / year', pw - 14, 230, { align: 'right' });

    // ── QR CODE ─────────────────────────────────────────────────────────────
    try {
      const qrUrl = `${window.location.origin}/hr/dashboard`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 100, margin: 1,
        color: { dark: '#1B2A4A', light: '#FFFFFF' }
      });
      // QR container
      doc.setFillColor(...white);
      doc.roundedRect(14, 240, 46, 46, 3, 3, 'F');
      doc.setDrawColor(...light);
      doc.roundedRect(14, 240, 46, 46, 3, 3, 'S');
      doc.addImage(qrDataUrl, 'PNG', 17, 243, 40, 40);
    } catch (e) {
      console.warn('QR generation failed', e);
    }

    // QR label
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Scan to access', 37, 289, { align: 'center' });
    doc.text('your policy portal', 37, 293, { align: 'center' });

    // ── LEGAL NOTE ──────────────────────────────────────────────────────────
    doc.setFillColor(...white);
    doc.roundedRect(64, 240, pw - 78, 46, 3, 3, 'F');
    doc.setDrawColor(...light);
    doc.roundedRect(64, 240, pw - 78, 46, 3, 3, 'S');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Notice', 70, 249);

    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const note = [
      'This certificate confirms that the above-mentioned company has an active',
      'group health insurance policy with SureHealth. Coverage is subject to the',
      'terms and conditions of the insurance plan selected. Claims must be filed',
      'within the stipulated claim window from the date of treatment.',
    ];
    note.forEach((line, i) => doc.text(line, 70, 258 + i * 5));

    doc.setTextColor(...navy);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SureHealth Insurance Platform  |  support@surehealth.com', 70, 281);

    // ── FOOTER BAND ─────────────────────────────────────────────────────────
    doc.setFillColor(...navy);
    doc.rect(0, ph - 8, pw, 8, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, ph - 8, pw, 1, 'F');
    doc.setTextColor(180, 200, 230);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `SureHealth Corporate Policy Certificate  |  ${policy.policyNumber}  |  Generated ${today}`,
      pw / 2, ph - 3, { align: 'center' }
    );

    // ── SAVE ─────────────────────────────────────────────────────────────────
    doc.save(`SureHealth_Policy_${policy.policyNumber || 'Certificate'}.pdf`);
  }

  /** Draws a two-column info grid card */
  private drawInfoCard(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    fields: [string, string][],
    navy: [number,number,number],
    muted: [number,number,number],
    white: [number,number,number],
    light: [number,number,number]
  ) {
    doc.setFillColor(...white);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setDrawColor(...light);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    const colW = (w - 4) / 2;
    const rowH = h / Math.ceil(fields.length / 2);

    fields.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 4 + col * (colW + 2);
      const cy = y + 5 + row * rowH;

      doc.setTextColor(...muted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(label.toUpperCase(), cx, cy);

      doc.setTextColor(...navy);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(value, cx, cy + 5.5);
    });
  }

  private fmt(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  /**
   * Loads the logo, scales it down to max 80x80px, and encodes as JPEG at 60% quality.
   * This keeps the embedded image under 10KB instead of potentially hundreds of MB.
   */
  private async loadLogoAsDataUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Cap the canvas at 80x80 to keep file size tiny
        const MAX = 80;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        // JPEG at 60% quality — typically <5KB for a logo
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = 'assets/logo.png';
    });
  }
}
