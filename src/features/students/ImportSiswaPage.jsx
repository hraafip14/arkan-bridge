import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { addStudent } from './studentsService';
import { formatKelasLabel } from '../classes/classesService';
import styles from './ImportSiswaPage.module.css';
import ConfirmModal from '../../components/common/ConfirmModal';

/**
 * Kolom yang dicari di file Excel (case-insensitive, trim).
 * Sesuaikan dengan header kolom Excel sekolah.
 */
const EXPECTED_COLUMNS = {
  nik:  ['induk', 'nik', 'no induk', 'nomor induk'],
  nama: ['nama siswa', 'nama', 'name'],
};

/**
 * Cari index kolom berdasarkan daftar kemungkinan header.
 */
const findColumnIndex = (headers, candidates) => {
  return headers.findIndex((h) =>
    candidates.includes(h.toString().toLowerCase().trim())
  );
};

const STEPS = {
  SELECT_CLASS : 'SELECT_CLASS',
  UPLOAD       : 'UPLOAD',
  PREVIEW      : 'PREVIEW',
  RESULT       : 'RESULT',
};

const ImportSiswaPage = ({ classes, existingStudents = [], onImportSuccess }) => {
  const [step,          setStep]          = useState(STEPS.SELECT_CLASS);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);
  const [parsedRows,    setParsedRows]    = useState([]);   // { nik, namaLengkap, isValid, error }
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [importResult,  setImportResult]  = useState(null); // { success: [], errors: [] }
  const [errorModal,    setErrorModal]    = useState({ isOpen: false, message: ''});
  const fileInputRef = useRef(null);

  // ===== Step 1: Pilih Kelas =====
  const handleKelasSelect = (kelas) => {
    setSelectedKelas(kelas);
    setStep(STEPS.UPLOAD);
  };

  // ===== Step 2: Parse Excel =====
  const parseExcelFile = useCallback((file) => {
    if (!file) return;

    // Validasi ekstensi file
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileExt   = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(fileExt)) {
      setErrorModal({ isOpen: true, message: 'File harus berformat .xlsx, .xls, atau .csv!'});
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook  = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet     = workbook.Sheets[sheetName];

        // Konversi ke array of arrays (dengan header)
        const rawData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        });

        if (rawData.length < 2) {
          setErrorModal({ isOpen: true, message: 'File Excel kosong atau tidak memiliki data!'});
          return;
        }

        // Cari baris header (baris pertama yang mengandung 'induk' atau 'nama')
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i].map((c) => c.toString().toLowerCase().trim());
          if (
            row.some((c) => EXPECTED_COLUMNS.nik.includes(c)) &&
            row.some((c) => EXPECTED_COLUMNS.nama.includes(c))
          ) {
            headerRowIndex = i;
            break;
          }
        }

        const headers  = rawData[headerRowIndex].map((h) => h.toString());
        const nikIdx   = findColumnIndex(headers, EXPECTED_COLUMNS.nik);
        const namaIdx  = findColumnIndex(headers, EXPECTED_COLUMNS.nama);

        if (nikIdx === -1 || namaIdx === -1) {
          setErrorModal({
            isOpen : true,
            message:
            'Kolom "Induk/NIK" atau "Nama Siswa" tidak ditemukan di file Excel.\n' +
            `Header yang terdeteksi: ${headers.join(', ')}`
        });
          return;
        }

        // Parse data rows
        const dataRows = rawData.slice(headerRowIndex + 1);

        // Buat Set NIK yang sudah ada untuk lookup O(1)
        const existingNiks = new Set(existingStudents.map((s) => s.nik.trim()));

        const parsed = dataRows
        .filter((row) => row.some((cell) => cell !== ''))
        .map((row, idx) => {
            const nik  = row[nikIdx]?.toString().trim()  ?? '';
            const nama = row[namaIdx]?.toString().trim() ?? '';

            let error = null;
            if (!nik)               error = 'NIK kosong';
            else if (!nama)         error = 'Nama kosong';
            else if (nik.length < 6) error = 'NIK terlalu pendek';
            else if (existingNiks.has(nik)) error = 'NIK sudah terdaftar';  // ← tambahkan ini

            return {
            rowNum:      headerRowIndex + idx + 2,
            nik,
            namaLengkap: nama,
            isValid:     error === null,
            error,
            };
        });

        setParsedRows(parsed);
        setStep(STEPS.PREVIEW);
      } catch (err) {
        setErrorModal({ isOpen: true, message: 'Gagal membaca file Excel. Pastikan format file benar.'});
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  }, [existingStudents]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseExcelFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) parseExcelFile(file);
    e.target.value = ''; // reset input
  };

  // ===== Step 3: Import ke Firestore =====
  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorModal({ isOpen: true, message: 'Tidak ada data valid untuk diimport!'});
      return;
    }

    setIsProcessing(true);
    const successList = [];
    const errorList   = [];

    for (const row of validRows) {
      try {
        await addStudent({
          nik:         row.nik,
          namaLengkap: row.namaLengkap,
          kelasId:     selectedKelas.id,
          kelasNama:   formatKelasLabel(selectedKelas),
        });
        successList.push(row);
      } catch (err) {
        errorList.push({ ...row, error: 'Gagal simpan ke database' });
      }
    }

    // Gabungkan error dari parsing + error dari Firestore
    const allErrors = [
      ...parsedRows.filter((r) => !r.isValid),
      ...errorList,
    ];

    setImportResult({ success: successList, errors: allErrors });
    setIsProcessing(false);
    setStep(STEPS.RESULT);

    if (successList.length > 0 && allErrors.length === 0) {
      onImportSuccess(successList.length);
    }
  };

  // ===== Download Error Report =====
  const handleDownloadErrorReport = () => {
    const errorData = importResult.errors.map((e) => ({
      'Baris Excel': e.rowNum,
      'NIK':         e.nik   || '(kosong)',
      'Nama Siswa':  e.namaLengkap || '(kosong)',
      'Keterangan Error': e.error,
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorData);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Report');
    XLSX.writeFile(workbook, `error_report_import_siswa_${selectedKelas?.namaKelas ?? ''}.xlsx`);
  };

  // ===== Reset ke awal =====
  const handleReset = () => {
    setStep(STEPS.SELECT_CLASS);
    setSelectedKelas(null);
    setParsedRows([]);
    setImportResult(null);
  };

  const validCount   = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <>
        <ConfirmModal
            isOpen={errorModal.isOpen}
            variant="danger"
            title="Terjadi Kesalahan"
            message={errorModal.message}
            confirmLabel="Mengerti"
            hideCancelButton={true}
            onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
            onCancel={() => setErrorModal({ isOpen: false, message: '' })}
        />
        <div className={styles.importWrap}>

            {/* ===== STEP INDICATOR ===== */}
            <div className={styles.stepBar}>
                {[
                { key: STEPS.SELECT_CLASS, num: 1, label: 'Pilih Kelas' },
                { key: STEPS.UPLOAD,       num: 2, label: 'Upload File' },
                { key: STEPS.PREVIEW,      num: 3, label: 'Preview Data' },
                { key: STEPS.RESULT,       num: 4, label: 'Hasil Import' },
                ].map((s, i, arr) => {
                const stepOrder  = Object.values(STEPS);
                const currentIdx = stepOrder.indexOf(step);
                const thisIdx    = stepOrder.indexOf(s.key);
                const isDone     = thisIdx < currentIdx;
                const isActive   = thisIdx === currentIdx;

                return (
                    <div key={s.key} className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}>
                        {isDone
                        ? <i className="ti ti-check" aria-hidden="true" />
                        : s.num}
                    </div>
                    <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                        {s.label}
                    </span>
                    {i < arr.length - 1 && (
                        <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                    )}
                    </div>
                );
                })}
            </div>

            {/* ===== STEP 1: PILIH KELAS ===== */}
            {step === STEPS.SELECT_CLASS && (
                <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <i className="ti ti-school" aria-hidden="true" />
                    Pilih Kelas Tujuan Import
                </div>
                <p className={styles.cardHint}>
                    Semua siswa dari file Excel akan didaftarkan ke kelas yang dipilih.
                </p>
                {classes.length === 0 ? (
                    <div className={styles.emptyState}>
                    Belum ada data kelas. Tambahkan kelas di menu Data Kelas terlebih dahulu.
                    </div>
                ) : (
                    <div className={styles.kelasGrid}>
                    {classes.map((k) => (
                        <button
                        key={k.id}
                        className={styles.kelasOption}
                        onClick={() => handleKelasSelect(k)}
                        >
                        <div className={styles.kelasOptionNum}>{k.kelasNumber}</div>
                        <div className={styles.kelasOptionName}>{k.namaKelas}</div>
                        <div className={styles.kelasOptionJk}>{k.jenisKelamin}</div>
                        </button>
                    ))}
                    </div>
                )}
                </div>
            )}

            {/* ===== STEP 2: UPLOAD FILE ===== */}
            {step === STEPS.UPLOAD && (
                <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <i className="ti ti-file-spreadsheet" aria-hidden="true" />
                    Upload File Excel
                </div>

                {/* Info kelas terpilih */}
                <div className={styles.selectedKelasInfo}>
                    <i className="ti ti-school" aria-hidden="true" />
                    Kelas terpilih:&nbsp;
                    <strong>{formatKelasLabel(selectedKelas)}</strong>
                    <button
                    className={styles.btnChangeKelas}
                    onClick={() => setStep(STEPS.SELECT_CLASS)}
                    >
                    <img src="/src/assets/ganti.png" alt="" /> Ganti Kelas
                    </button>
                </div>

                {/* Drag & drop zone */}
                <div
                    className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    />
                    <div className={styles.dropZoneIcon}>
                    <i className="ti ti-cloud-upload" aria-hidden="true" />
                    </div>
                    <p className={styles.dropZoneText}>
                    Drag & drop file Excel di sini, atau{' '}
                    <span className={styles.dropZoneBrowse}>klik untuk browse</span>
                    </p>
                    <p className={styles.dropZoneHint}>
                    Format yang didukung: .xlsx, .xls, .csv
                    </p>
                </div>

                {/* Panduan kolom */}
                <div className={styles.guideBox}>
                    <div className={styles.guideTitle}>
                    <i className="ti ti-info-circle" aria-hidden="true" />
                    Panduan Format Excel
                    </div>
                    <p className={styles.guideText}>
                    Pastikan file Excel memiliki kolom <strong>Induk</strong> (NIK)
                    dan <strong>Nama Siswa</strong>. Kolom lain akan diabaikan.
                    Sistem akan otomatis mendeteksi header kolom.
                    </p>
                </div>
                </div>
            )}

            {/* ===== STEP 3: PREVIEW ===== */}
            {step === STEPS.PREVIEW && (
                <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <i className="ti ti-table" aria-hidden="true" />
                    Preview Data — {formatKelasLabel(selectedKelas)}
                </div>

                {/* Summary */}
                <div className={styles.previewSummary}>
                    <div className={styles.summaryItem}>
                    <span className={styles.summaryNum}>{parsedRows.length}</span>
                    <span className={styles.summaryLabel}>Total Baris</span>
                    </div>
                    <div className={`${styles.summaryItem} ${styles.summarySuccess}`}>
                    <span className={styles.summaryNum}>{validCount}</span>
                    <span className={styles.summaryLabel}>Data Valid</span>
                    </div>
                    <div className={`${styles.summaryItem} ${invalidCount > 0 ? styles.summaryError : styles.summaryNeutral}`}>
                    <span className={styles.summaryNum}>{invalidCount}</span>
                    <span className={styles.summaryLabel}>Data Error</span>
                    </div>
                </div>

                {invalidCount > 0 && (
                    <div className={styles.warningBox}>
                    <i className="ti ti-alert-triangle" aria-hidden="true" />
                    Terdapat {invalidCount} baris dengan error. Baris tersebut akan
                    dilewati saat import. Kamu bisa download error report setelah
                    proses import selesai.
                    </div>
                )}

                {/* Tabel preview */}
                <div className={styles.previewTableWrap}>
                    <table className={styles.previewTable}>
                    <thead>
                        <tr>
                        <th>Baris</th>
                        <th>NIK</th>
                        <th>Nama Siswa</th>
                        <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedRows.map((row, i) => (
                        <tr key={i} className={!row.isValid ? styles.rowError : ''}>
                            <td className={styles.tdMuted}>{row.rowNum}</td>
                            <td className={styles.tdMono}>{row.nik || '—'}</td>
                            <td>{row.namaLengkap || '—'}</td>
                            <td>
                            {row.isValid ? (
                                <span className={styles.badgeValid}>
                                <i className="ti ti-check" aria-hidden="true" /> Valid
                                </span>
                            ) : (
                                <span className={styles.badgeError}>
                                <i className="ti ti-x" aria-hidden="true" /> {row.error}
                                </span>
                            )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                {/* Tombol aksi */}
                <div className={styles.previewActions}>
                    <button
                    className={styles.btnSecondary}
                    onClick={() => setStep(STEPS.UPLOAD)}
                    >
                    <img src="/src/assets/file.png" alt="" /> Ganti File
                    </button>
                    <button
                    className={styles.btnImport}
                    onClick={handleImport}
                    disabled={validCount === 0 || isProcessing}
                    >
                    {isProcessing ? (
                        <>
                        <i className="ti ti-loader ti-spin" aria-hidden="true" />
                        Mengimport {validCount} siswa...
                        </>
                    ) : (
                        <>
                        <img src="/src/assets/upload.png" alt="" />
                        Upload dan Import {validCount} Data Valid
                        </>
                    )}
                    </button>
                </div>
                </div>
            )}

            {/* ===== STEP 4: RESULT ===== */}
            {step === STEPS.RESULT && importResult && (
                <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <i className="ti ti-chart-bar" aria-hidden="true" />
                    Hasil Import — {formatKelasLabel(selectedKelas)}
                </div>

                {/* Result summary */}
                <div className={styles.resultSummary}>
                    <div className={styles.resultBox}>
                    <i className="ti ti-circle-check" style={{ fontSize: '2rem', color: 'var(--color-success-600)' }} aria-hidden="true" />
                    <span className={styles.resultNum}>{importResult.success.length}</span>
                    <span className={styles.resultLabel}>Berhasil diimport</span>
                    </div>
                    <div className={styles.resultBox}>
                    <i className="ti ti-circle-x" style={{ fontSize: '2rem', color: 'var(--color-danger-500)' }} aria-hidden="true" />
                    <span className={styles.resultNum}>{importResult.errors.length}</span>
                    <span className={styles.resultLabel}>Gagal / Error</span>
                    </div>
                </div>

                {/* Error detail */}
                {importResult.errors.length > 0 && (
                    <>
                    <div className={styles.warningBox}>
                        <i className="ti ti-alert-triangle" aria-hidden="true" />
                        Data berikut tidak berhasil diimport. Download error report,
                        perbaiki data di file Excel, lalu upload ulang.
                    </div>
                    <div className={styles.previewTableWrap}>
                        <table className={styles.previewTable}>
                        <thead>
                            <tr>
                            <th>Baris</th>
                            <th>NIK</th>
                            <th>Nama Siswa</th>
                            <th>Keterangan Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importResult.errors.map((e, i) => (
                            <tr key={i} className={styles.rowError}>
                                <td className={styles.tdMuted}>{e.rowNum}</td>
                                <td className={styles.tdMono}>{e.nik || '—'}</td>
                                <td>{e.namaLengkap || '—'}</td>
                                <td>
                                <span className={styles.badgeError}>{e.error}</span>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    <button
                        className={styles.btnDownloadError}
                        onClick={handleDownloadErrorReport}
                    >
                        <i className="ti ti-download" aria-hidden="true" />
                        Download Error Report (.xlsx)
                    </button>
                    </>
                )}

                {/* Tombol aksi */}
                <div className={styles.previewActions} style={{ marginTop: '1rem' }}>
                    {importResult.errors.length > 0 && (
                    <button
                        className={styles.btnSecondary}
                        onClick={() => setStep(STEPS.UPLOAD)}
                    >
                        <i className="ti ti-upload" aria-hidden="true" /> Upload Ulang
                    </button>
                    )}
                    <button className={styles.btnImport} onClick={handleReset}>
                    <i className="ti ti-plus" aria-hidden="true" />
                    Import Kelas Lain
                    </button>
                </div>
                </div>
            )}
        </div>
    </>
  );
};

export default ImportSiswaPage;