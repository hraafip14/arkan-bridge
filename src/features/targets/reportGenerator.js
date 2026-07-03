import { pdf }        from '@react-pdf/renderer';
import { createElement } from 'react';
import { KELAS_LIST, getTargetByKelas } from './targetsService';
import ReportTemplate from './ReportTemplate';

/**
 * Fetch semua data target yang dibutuhkan untuk laporan.
 * Diekspor supaya bisa dipakai ReportModal saat preview.
 *
 * @param {string|null} kelasNumber - null = semua kelas
 * @returns {Promise<Array>} array of { kelasNumber, ...targetData }
 */
export const fetchReportData = async (kelasNumber) => {
  const kelasList = kelasNumber ? [kelasNumber] : KELAS_LIST;

  const results = await Promise.all(
    kelasList.map(async (kelas) => {
      const data = await getTargetByKelas(kelas);
      return { kelasNumber: kelas, ...(data ?? {}) };
    })
  );

  return results;
};

/**
 * Generate PDF blob dari data target.
 *
 * @param {Object} options
 * @param {string|null} options.kelasNumber - null = semua kelas
 * @param {string} options.semester         - '1' atau '2'
 * @param {string} options.tahunAjaran      - e.g. '2024/2025'
 * @returns {Promise<Blob>}
 */
export const generateTargetReportBlob = async ({
  kelasNumber = null,
  semester,
  tahunAjaran,
}) => {
  const reportData = await fetchReportData(kelasNumber);

  // createElement dipakai karena file ini adalah .js, bukan .jsx
  const element = createElement(ReportTemplate, {
    reportData,
    semester,
    tahunAjaran,
  });

  const blob = await pdf(element).toBlob();
  return blob;
};

/**
 * Trigger download PDF di browser.
 * @param {Blob}   blob
 * @param {string} filename
 */
export const downloadPdfBlob = (blob, filename) => {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper: buat nama file PDF otomatis.
 */
export const buildPdfFilename = ({ kelasNumber, semester, tahunAjaran }) => {
  const kelasLabel = kelasNumber
    ? `_${kelasNumber.replace(/\s+/g, '-')}`
    : '_All-Classes';
  return `Bilingual-Target-Report${kelasLabel}_${semester}-Semester_TA-${tahunAjaran.replace('/', '-')}.pdf`;
};