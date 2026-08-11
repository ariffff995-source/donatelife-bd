/**
 * Export Helper Utility for DonateLife BD
 * Supports CSV, Excel (Spreadsheet XML), and PDF reports.
 */

export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines: string[] = [];

  // Header line
  csvLines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data lines
  for (const row of rows) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvLines.push(values.join(','));
  }

  const csvString = csvLines.join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, rows: Record<string, any>[], sheetTitle: string = 'DonateLife Report') {
  if (!rows || rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = Object.keys(rows[0]);

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#E11D48" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetTitle}">
  <Table>
   <Row ss:StyleID="Header">`;

  headers.forEach(h => {
    xml += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `</Row>`;

  rows.forEach(row => {
    xml += `<Row ss:StyleID="Data">`;
    headers.forEach(h => {
      const val = row[h];
      const strVal = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      xml += `<Cell><Data ss:Type="String">${escapeXml(strVal)}</Data></Cell>`;
    });
    xml += `</Row>`;
  });

  xml += `</Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPdf(filename: string, title: string, columns: { header: string; key: string }[], rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF report.');
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeXml(title)}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #0f172a; }
    .header { display: flex; align-items: center; justify-content: space-between; border-b: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 800; color: #e11d48; }
    .meta { font-size: 12px; color: #64748b; text-align: right; }
    h1 { font-size: 18px; margin: 0 0 16px 0; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background-color: #e11d48; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">DonateLife BD</div>
    <div class="meta">
      <div>Generated: ${new Date().toLocaleString()}</div>
      <div>Emergency Blood Network</div>
    </div>
  </div>
  <h1>${escapeXml(title)}</h1>
  <table>
    <thead>
      <tr>
        ${columns.map(c => `<th>${escapeXml(c.header)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr>
          ${columns.map(c => `<td>${escapeXml(row[c.key] === null || row[c.key] === undefined ? '-' : String(row[c.key]))}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    DonateLife BD &copy; ${new Date().getFullYear()} — Emergency Voluntary Blood Donation Platform Bangladesh
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
