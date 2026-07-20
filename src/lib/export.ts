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

export async function downloadPDF(r: MinisterRecord): Promise<void> {
  const jspdfModule = await import('jspdf');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

  return new Promise((resolve) => {
    let target = document.getElementById('pdfRenderTarget');
    if (!target) {
      target = document.createElement('div');
      target.id = 'pdfRenderTarget';
      target.style.cssText = 'position:fixed;left:-9999px;top:0;width:760px;';
      document.body.appendChild(target);
    }
    target.innerHTML = cvHTML(r);

    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(target, {
      x: 20,
      y: 20,
      width: 555,
      windowWidth: 800,
      html2canvas: { scale: 0.72, useCORS: true },
      callback: function (d: { save: (name: string) => void }) {
        d.save(fileSafeName(r.name) + '-CV.pdf');
        target!.innerHTML = '';
        resolve();
      },
    });
  });
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

  let target = document.getElementById('pdfRenderTarget');
  if (!target) {
    target = document.createElement('div');
    target.id = 'pdfRenderTarget';
    target.style.cssText = 'position:fixed;left:-9999px;top:0;width:760px;';
    document.body.appendChild(target);
  }

  for (const r of records) {
    // Word
    wordFolder.file(
      fileSafeName(r.name) + '-CV.doc',
      '\ufeff' + wordDocString(r)
    );

    // PDF
    await new Promise<void>((resolve) => {
      target!.innerHTML = cvHTML(r);
      const doc = new jsPDF('p', 'pt', 'a4');
      doc.html(target!, {
        x: 20,
        y: 20,
        width: 555,
        windowWidth: 800,
        html2canvas: { scale: 0.72, useCORS: true },
        callback: function (d: { output: (type: string) => Blob }) {
          const blob = d.output('blob');
          pdfFolder.file(fileSafeName(r.name) + '-CV.pdf', blob);
          target!.innerHTML = '';
          resolve();
        },
      });
    });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zipBlob);
  a.download = 'ministers-cv-register.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
