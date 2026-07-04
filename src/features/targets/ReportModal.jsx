import { useState, useMemo, createElement } from 'react';
import { BlobProvider, pdf } from '@react-pdf/renderer';
import { KELAS_LIST } from './targetsService';
import {
  fetchReportData,
  downloadPdfBlob,
  buildPdfFilename,
} from './reportGenerator';
import ReportTemplate from './ReportTemplate';
import styles from './ReportModal.module.css';

const CURRENT_YEAR = new Date().getFullYear();

// ===== KOMPONEN KONTEN PREVIEW (dipisah supaya useEffect aman) =====
const PdfPreviewContent = ({ document, onBlobReady }) => (
  <BlobProvider document={document}>
    {({ blob, url, loading, error }) => {
      // Kirim blob ke parent saat sudah siap (untuk tombol download)
      if (!loading && blob) onBlobReady?.(blob);

      if (loading) {
        return (
          <div className={styles.previewLoading}>
            <i className="ti ti-loader ti-spin" style={{ fontSize: '1.8rem' }} aria-hidden="true" />
            <span className={styles.previewLoadingText}>Generating preview...</span>
            <span className={styles.previewLoadingHint}>
              Please wait, PDF is rendering...
            </span>
          </div>
        );
      }

      if (error) {
        return (
          <div className={styles.previewError}>
            <i className="ti ti-alert-circle" style={{ fontSize: '2rem' }} aria-hidden="true" />
            <span>Failed to render PDF preview.</span>
            <span className={styles.previewErrorHint}>
              Try clicking the "Download PDF" button to download directly.
            </span>
          </div>
        );
      }

      return (
        <iframe
          src={url}
          className={styles.previewIframe}
          title="Preview PDF Report"
        />
      );
    }}
  </BlobProvider>
);

// ===== MAIN MODAL COMPONENT =====
const ReportModal = ({ isOpen, onClose }) => {
  const [scope, setScope] = useState('all');
  const [kelasNumber, setKelasNumber] = useState('');
  const [semester, setSemester] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState(
    `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`
  );
  const [mode, setMode] = useState('form'); // 'form' | 'preview'
  const [reportData, setReportData] = useState(null);
  const [blobReady, setBlobReady] = useState(null);  // blob dari BlobProvider
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentKelas = scope === 'single' ? kelasNumber : null;

  const pdfDocument = useMemo(() => {
    if (!reportData) return null;
    return createElement(ReportTemplate, { reportData, semester, tahunAjaran });
  }, [reportData, semester, tahunAjaran]);

  const filename = buildPdfFilename({
    kelasNumber: scope === 'single' ? (kelasNumber || 'Kelas') : null,
    semester,
    tahunAjaran: tahunAjaran || 'YYYY-YYYY',
  });

  if (!isOpen) return null;

  // ===== Validasi form =====
  const validate = () => {
    if (scope === 'single' && !kelasNumber) {
      setErrorMsg('Please select a class first!');
      return false;
    }
    if (!tahunAjaran.trim()) {
      setErrorMsg('Academic Year must be filled!');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // ===== Preview: fetch data → tampilkan iframe =====
  const handlePreview = async () => {
    if (!validate()) return;
    setIsFetching(true);
    try {
      const data = await fetchReportData(currentKelas);
      setReportData(data);
      setBlobReady(null);   // reset blob lama
      setMode('preview');
    } catch {
      setErrorMsg('Failed to load data. Check your connection and try again.');
    } finally {
      setIsFetching(false);
    }
  };

  // ===== Download: pakai blob dari BlobProvider kalau sudah ada,
  //               atau generate ulang dari reportData =====
  const handleDownload = async () => {
    if (!validate()) return;
    setIsDownloading(true);
    try {
      let targetBlob = blobReady;

      if (!targetBlob) {
        // Belum ada blob (download langsung dari form tanpa preview dulu)
        let data = reportData;
        if (!data) data = await fetchReportData(currentKelas);

        const element = createElement(ReportTemplate, {
          reportData: data,
          semester,
          tahunAjaran,
        });
        targetBlob = await pdf(element).toBlob();
      }

      downloadPdfBlob(
        targetBlob,
        buildPdfFilename({ kelasNumber: currentKelas, semester, tahunAjaran })
      );
      handleClose();
    } catch {
      setErrorMsg('Failed to generate PDF. Try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setMode('form');
    setReportData(null);
    setBlobReady(null);
    setErrorMsg('');
    onClose();
  };

  // ================================================================
  // PREVIEW MODE
  // ================================================================
  if (mode === 'preview' && reportData && pdfDocument) {
    return (
      <div className={styles.overlayPreview} onClick={handleClose}>
        <div
          className={styles.modalPreview}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview header */}
          <div className={styles.previewHeader}>
            <div className={styles.previewHeaderLeft}>
              <div className={styles.previewHeaderIcon}>
                <img src="/assets/print.png" alt="PDF" />
              </div>
              <div>
                <div className={styles.previewHeaderTitle}>Preview Report</div>
                <div className={styles.previewHeaderFilename}>{filename}</div>
              </div>
            </div>
            <div className={styles.previewHeaderActions}>
              <button
                className={styles.btnBackToForm}
                onClick={() => setMode('form')}
                disabled={isDownloading}
              >
                <i className="ti ti-arrow-left" aria-hidden="true" />
                Back to Form
              </button>
              <button
                className={styles.btnDownloadPreview}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <i className="ti ti-loader ti-spin" aria-hidden="true" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <img src="/assets/download.png" alt="PDF" />
                    Download PDF
                  </>
                )}
              </button>
              <button
                className={styles.btnClosePreview}
                onClick={handleClose}
                aria-label="Close"
              >
                <img src="/assets/cancel.png" alt="Close" />
              </button>
            </div>
          </div>

          {/* PDF iframe via BlobProvider */}
          <div className={styles.previewBody}>
            <PdfPreviewContent
              document={pdfDocument}
              onBlobReady={(blob) => {
                if (!blobReady) setBlobReady(blob);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // FORM MODE
  // ================================================================
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            <img src="/assets/pdf.png" alt="PDF" />
          </div>
          <div>
            <div className={styles.modalTitle}>Generate Target Report</div>
            <div className={styles.modalSubtitle}>
              Generate bilingual target reports in PDF format
            </div>
          </div>
          <button
            className={styles.btnClose}
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>

          {/* Scope */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Report Scope</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioOption} ${scope === 'all' ? styles.radioActive : ''
                  }`}
              >
                <input
                  type="radio" name="scope" value="all"
                  checked={scope === 'all'}
                  onChange={() => { setScope('all'); setKelasNumber(''); }}
                />
                <i className="ti ti-layout-grid" aria-hidden="true" />
                All Classes
              </label>
              <label
                className={`${styles.radioOption} ${scope === 'single' ? styles.radioActive : ''
                  }`}
              >
                <input
                  type="radio" name="scope" value="single"
                  checked={scope === 'single'}
                  onChange={() => setScope('single')}
                />
                <i className="ti ti-school" aria-hidden="true" />
                Single Class
              </label>
            </div>
          </div>

          {/* Pilih Kelas (conditional) */}
          {scope === 'single' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Select Class <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={kelasNumber}
                onChange={(e) => setKelasNumber(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {KELAS_LIST.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          )}

          {/* Semester */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Semester</label>
            <div className={styles.radioGroup}>
              {['1st', '2nd'].map((s) => (
                <label
                  key={s}
                  className={`${styles.radioOption} ${semester === s ? styles.radioActive : ''
                    }`}
                >
                  <input
                    type="radio" name="semester" value={s}
                    checked={semester === s}
                    onChange={() => setSemester(s)}
                  />
                  {s} Semester
                </label>
              ))}
            </div>
          </div>

          {/* Tahun Ajaran */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Academic Year <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. 2024/2025"
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
            />
          </div>

          {/* Filename preview */}
          <div className={styles.filenamePreview}>
            <i className="ti ti-file-type-pdf" aria-hidden="true" />
            <span>{filename}</span>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className={styles.errorMsg}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            className={styles.btnCancel}
            onClick={handleClose}
            disabled={isFetching || isDownloading}
          >
            Close
          </button>
          <button
            className={styles.btnPreview}
            onClick={handlePreview}
            disabled={isFetching || isDownloading}
          >
            {isFetching ? (
              <>
                <i className="ti ti-loader ti-spin" aria-hidden="true" />
                Loading data...
              </>
            ) : (
              <>
                Preview Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;