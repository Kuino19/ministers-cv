import { MinisterRecord } from './types';
import { cvHTML, fileSafeName, esc } from './cv-template';

function wordDocString(r: MinisterRecord): string {
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${esc(r.name)} - CV</title></head>
  <body>${cvHTML(r)}</body></html>`;
}

export function downloadWord(r: MinisterRecord): void {
  const blob = new Blob(['\ufeff', wordDocString(r)], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileSafeName(r.name) + '-CV.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function renderCanvasForRecord(r: MinisterRecord): Promise<HTMLCanvasElement> {
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;

  let target = document.getElementById('pdfRenderTarget');
  if (!target) {
    target = document.createElement('div');
    target.id = 'pdfRenderTarget';
    document.body.appendChild(target);
  }

  // Position at (0,0) behind page with opacity 1 so html2canvas renders full opacity
  target.style.cssText = 'position:fixed;top:0;left:0;width:750px;z-index:-99999;opacity:1;visibility:visible;pointer-events:none;background:#ffffff;padding:0;margin:0;';
  target.innerHTML = cvHTML(r);

  // Small delay to ensure browser layout and fonts are fully calculated
  await new Promise((res) => setTimeout(res, 60));

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 750,
  });

  target.innerHTML = '';
  return canvas;
}

export async function downloadPDF(r: MinisterRecord): Promise<void> {
  const jspdfModule = await import('jspdf');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

  const canvas = await renderCanvasForRecord(r);
  const imgData = canvas.toDataURL('image/png');

  // A4 dimensions in pt: 595.28 x 841.89
  const doc = new jsPDF('p', 'pt', 'a4');
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  const imgWidth = pdfWidth - 40; // 20pt margin on left/right
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 20;

  doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
  heightLeft -= (pdfHeight - 40);

  // Multi-page handling if CV is long
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 20;
    doc.addPage();
    doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 40);
  }

  doc.save(fileSafeName(r.name) + '-CV.pdf');
}

export async function downloadAllZIP(records: MinisterRecord[]): Promise<void> {
  const [jspdfModule, JSZipModule] = await Promise.all([
    import('jspdf'),
    import('jszip'),
  ]);
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
  const JSZip = JSZipModule.default;

  const zip = new JSZip();
  const wordFolder = zip.folder('Word')!;
  const pdfFolder = zip.folder('PDF')!;

  for (const r of records) {
    // Word
    wordFolder.file(
      fileSafeName(r.name) + '-CV.doc',
      '\ufeff' + wordDocString(r)
    );

    // PDF
    const canvas = await renderCanvasForRecord(r);
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 20;

    doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 40);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 20;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 40);
    }

    const blob = doc.output('blob');
    pdfFolder.file(fileSafeName(r.name) + '-CV.pdf', blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zipBlob);
  a.download = 'ministers-cv-register.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
