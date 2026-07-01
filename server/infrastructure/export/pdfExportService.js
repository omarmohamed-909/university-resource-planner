const PDFDocument = require('pdfkit');
const path = require('path');
const arabicReshaper = require('arabic-reshaper');

const DAY_LABELS = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس'
};

const WEEK_LABELS = { weekly: 'أسبوعي', odd: 'فردي', even: 'زوجي' };
const STATUS_LABELS = { present: 'حاضر', absent: 'غائب' };

class PdfExportService {
  constructor() {
    this.fontsDir = path.join(__dirname, 'fonts');
  }

  _ar(text) {
    return arabicReshaper.convertArabic(String(text || ''));
  }

  _createDoc({ title, layout = 'landscape' } = {}) {
    const doc = new PDFDocument({
      size: 'A4',
      layout,
      margin: 20,
      info: { Title: title || 'QNU Export', Creator: 'QNU System' }
    });
    doc.registerFont('Arabic', path.join(this.fontsDir, 'NotoNaskhArabic-Regular.ttf'));
    doc.registerFont('ArabicBold', path.join(this.fontsDir, 'NotoNaskhArabic-Regular.ttf'));
    return doc;
  }

  _toBuffer(doc) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  _drawTable(doc, { headers, rows, colWidths, startY, headerBg = '#1e293b', headerColor = '#ffffff', pageMargin = 20 }) {
    const pageWidth = doc.page.width;
    const availWidth = pageWidth - pageMargin * 2;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const scale = tableWidth > availWidth ? availWidth / tableWidth : 1;
    const scaledCols = colWidths.map(w => Math.floor(w * scale));
    const finalTableWidth = scaledCols.reduce((a, b) => a + b, 0);
    const startX = pageMargin + (availWidth - finalTableWidth);
    const headerH = 24;
    const rowH = 20;
    let y = startY != null ? startY : doc.y;

    const drawHeader = () => {
      doc.rect(startX, y, finalTableWidth, headerH).fill(headerBg);
      doc.fillColor(headerColor).font('ArabicBold').fontSize(8);
      let hx = startX;
      headers.forEach((h, i) => {
        doc.text(this._ar(h), hx + 3, y + 5, { width: scaledCols[i], align: 'right', lineBreak: false });
        hx += scaledCols[i];
      });
      y += headerH;
    };

    drawHeader();

    doc.font('Arabic').fontSize(7.5);
    for (let ri = 0; ri < rows.length; ri++) {
      if (y + rowH > doc.page.height - pageMargin) {
        doc.addPage();
        y = pageMargin;
        drawHeader();
      }

      if (ri % 2 === 0) {
        doc.rect(startX, y, finalTableWidth, rowH).fill('#f8fafc');
      }

      let rx = startX;
      rows[ri].forEach((cell, ci) => {
        doc.fillColor('#000000');
        const text = String(cell || '');
        const maxLen = Math.floor(scaledCols[ci] / 5);
        const display = text.length > maxLen ? text.slice(0, maxLen - 2) + '…' : text;
        doc.text(this._ar(display), rx + 3, y + 4, { width: scaledCols[ci], align: 'right', lineBreak: false });
        rx += scaledCols[ci];
      });
      y += rowH;
    }

    doc.fillColor('#000000');
    return y;
  }

  _addHeader(doc, title, subtitle) {
    doc.font('ArabicBold').fontSize(18).text(this._ar(title), { align: 'right' });
    doc.moveDown(0.2);
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Arabic').fontSize(8).fillColor('#666666')
      .text(this._ar(`${subtitle || ''} — تاريخ التصدير: ${dateStr}`), { align: 'right' });
    doc.fillColor('#000000').moveDown(0.5);
  }

  async exportSchedules(schedules) {
    const doc = this._createDoc({ title: 'الجداول الدراسية' });
    this._addHeader(doc, 'الجداول الدراسية', `${schedules.length} محاضرة`);

    const headers = ['المادة', 'الكود', 'اليوم', 'الوقت', 'القاعة', 'النمط', 'الفصل'];
    const colWidths = [120, 70, 70, 80, 80, 60, 80];

    const rows = schedules.map(s => [
      s.courseId?.name || '',
      s.courseId?.code || '',
      DAY_LABELS[s.day] || s.day,
      `${s.startTime || ''} - ${s.endTime || ''}`,
      s.hallId?.name || '',
      WEEK_LABELS[s.weekPattern] || s.weekPattern || '',
      s.semester || ''
    ]);

    this._drawTable(doc, { headers, rows, colWidths });
    doc.end();

    return this._toBuffer(doc);
  }

  async exportAttendance(records, scheduleInfo) {
    const doc = this._createDoc({ title: 'سجل الحضور', layout: 'portrait' });
    const scheduleLabel = scheduleInfo
      ? `${scheduleInfo.courseName || ''} - ${DAY_LABELS[scheduleInfo.day] || ''} ${scheduleInfo.startTime || ''}`
      : '';
    this._addHeader(doc, 'سجل الحضور', scheduleLabel);

    const headers = ['الطالب', 'البريد الإلكتروني', 'القسم', 'الحالة', 'الوقت'];
    const colWidths = [130, 160, 100, 60, 80];

    const rows = records.map(r => [
      r.studentId?.name || '',
      r.studentId?.email || '',
      r.studentId?.department || '',
      STATUS_LABELS[r.status] || r.status || '',
      r.createdAt ? new Date(r.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''
    ]);

    this._drawTable(doc, { headers, rows, colWidths });

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    doc.moveDown(1);
    doc.font('ArabicBold').fontSize(9).text(
      this._ar(`ملخص: ${present} حاضر — ${absent} غائب — ${records.length} إجمالي`),
      { align: 'right' }
    );

    doc.end();
    return this._toBuffer(doc);
  }

  async exportStudentAttendance(records, studentInfo) {
    const doc = this._createDoc({ title: 'سجل الحضور الشخصي', layout: 'portrait' });
    this._addHeader(doc, 'سجل الحضور الشخصي', studentInfo?.name || '');

    const headers = ['المادة', 'التاريخ', 'الحالة', 'الوقت'];
    const colWidths = [170, 110, 70, 80];

    const rows = records.map(r => {
      let courseName = '';
      if (r.scheduleId && typeof r.scheduleId === 'object') {
        courseName = r.scheduleId.courseId?.name || r.scheduleId.courseId?.code || '';
      }
      return [
        courseName,
        r.date ? new Date(r.date).toLocaleDateString('ar-EG') : '',
        STATUS_LABELS[r.status] || r.status || '',
        r.createdAt ? new Date(r.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''
      ];
    });

    this._drawTable(doc, { headers, rows, colWidths });
    doc.end();
    return this._toBuffer(doc);
  }
}

module.exports = PdfExportService;
