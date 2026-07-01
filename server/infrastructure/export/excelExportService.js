const ExcelJS = require('exceljs');

const DAY_LABELS = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس'
};

const WEEK_LABELS = { weekly: 'أسبوعي', odd: 'فردي', even: 'زوجي' };
const STATUS_LABELS = { present: 'حاضر', absent: 'غائب' };

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
const HEADER_FONT = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
const CELL_FONT = { name: 'Arial', size: 10 };
const ALT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

class ExcelExportService {
  _createWorkbook(sheetName) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'QNU System';
    const ws = wb.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });
    return { wb, ws };
  }

  _styleHeader(ws, headers, colWidths) {
    const row = ws.addRow(headers);
    row.height = 30;
    row.eachCell((cell, col) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (colWidths[col - 1]) cell.width = colWidths[col - 1];
    });
    return row;
  }

  async _toBuffer(wb) {
    return wb.xlsx.writeBuffer();
  }

  async exportSchedules(schedules) {
    const { wb, ws } = this._createWorkbook('الجداول الدراسية');

    const headers = ['المادة', 'الكود', 'اليوم', 'وقت البداية', 'وقت النهاية', 'القاعة', 'النمط', 'الفصل'];
    const colWidths = [25, 12, 10, 12, 12, 15, 8, 12];

    this._styleHeader(ws, headers, colWidths);

    schedules.forEach((s, i) => {
      const row = ws.addRow([
        s.courseId?.name || '',
        s.courseId?.code || '',
        DAY_LABELS[s.day] || s.day,
        s.startTime || '',
        s.endTime || '',
        s.hallId?.name || '',
        WEEK_LABELS[s.weekPattern] || s.weekPattern || '',
        s.semester || ''
      ]);
      row.eachCell(cell => {
        cell.font = CELL_FONT;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (i % 2 === 1) cell.fill = ALT_FILL;
      });
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: schedules.length + 1, column: headers.length }
    };

    return this._toBuffer(wb);
  }

  async exportAttendance(records, scheduleInfo) {
    const { wb, ws } = this._createWorkbook('سجل الحضور');

    const headers = ['الطالب', 'البريد الإلكتروني', 'القسم', 'الحالة', 'الوقت'];
    const colWidths = [25, 30, 15, 10, 12];

    this._styleHeader(ws, headers, colWidths);

    records.forEach((r, i) => {
      const row = ws.addRow([
        r.studentId?.name || '',
        r.studentId?.email || '',
        r.studentId?.department || '',
        STATUS_LABELS[r.status] || r.status || '',
        r.createdAt ? new Date(r.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''
      ]);
      row.eachCell(cell => {
        cell.font = CELL_FONT;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (i % 2 === 1) cell.fill = ALT_FILL;
      });
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: records.length + 1, column: headers.length }
    };

    return this._toBuffer(wb);
  }

  async exportStudentAttendance(records, studentInfo) {
    const { wb, ws } = this._createWorkbook('سجل الحضور');

    const headers = ['المادة', 'التاريخ', 'الحالة', 'الوقت'];
    const colWidths = [30, 15, 10, 12];

    this._styleHeader(ws, headers, colWidths);

    records.forEach((r, i) => {
      let courseName = '';
      if (r.scheduleId && typeof r.scheduleId === 'object') {
        courseName = r.scheduleId.courseId?.name || r.scheduleId.courseId?.code || '';
      }
      const row = ws.addRow([
        courseName,
        r.date ? new Date(r.date).toLocaleDateString('ar-EG') : '',
        STATUS_LABELS[r.status] || r.status || '',
        r.createdAt ? new Date(r.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''
      ]);
      row.eachCell(cell => {
        cell.font = CELL_FONT;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (i % 2 === 1) cell.fill = ALT_FILL;
      });
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: records.length + 1, column: headers.length }
    };

    return this._toBuffer(wb);
  }
}

module.exports = ExcelExportService;
