import { useState } from 'react';
import styles from './AturTargetPage.module.css';

/**
 * ReadingCategoryBlock
 *
 * Berbeda dari CategoryBlock (yang pakai word list),
 * komponen ini menggunakan textarea untuk menampung
 * teks paragraf atau dialog per kategori reading.
 *
 * Data struktur kategori reading:
 * { name: string, content: string }
 */
const ReadingCategoryBlock = ({
  index,
  category,
  onEditName,
  onDelete,
  onEditContent,
}) => {
  const [isEditName, setIsEditName] = useState(false);
  const [tempName,   setTempName]   = useState(category.name);

  const handleNameBlur = () => {
    onEditName(tempName);
    setIsEditName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEditName(tempName);
      setIsEditName(false);
    }
  };

  return (
    <div className={styles.contentCard}>
      {/* Header: nama kategori + tombol aksi */}
      <div className={styles.contentCardHeader}>
        {isEditName ? (
          <input
            className={styles.cardTitleInput}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <span className={styles.contentCardTitle}>
            <i className="ti ti-book-2" aria-hidden="true" />
            {category.name || `Category ${index + 1}`}
          </span>
        )}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            className={styles.btnEditSmall}
            onClick={() => setIsEditName(true)}
          >
            <i className="ti ti-pencil" aria-hidden="true" /> Edit Name
          </button>
          <button className={styles.btnDelSmall} onClick={onDelete}>
            <i className="ti ti-trash" aria-hidden="true" /> Delete
          </button>
        </div>
      </div>

      {/* Textarea konten paragraf / dialog */}
      <div className={styles.readingContentWrap}>
        <label className={styles.readingContentLabel}>
          <i className="ti ti-text-size" aria-hidden="true" />
          Teks Paragraf / Dialog
        </label>
        <textarea
          className={styles.readingContentTextarea}
          placeholder="Masukkan teks paragraf atau dialog di sini...&#10;&#10;Contoh dialog:&#10;A: Good morning!&#10;B: Good morning! How are you?&#10;A: I am fine, thank you."
          value={category.content ?? ''}
          onChange={(e) => onEditContent(e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
};

export default ReadingCategoryBlock;