import { useState } from 'react';
import styles from './AturTargetPage.module.css';

const CategoryBlock = ({
  index, category, onEditName, onDelete,
  onAddWord, onDeleteWord, onEditWord,
}) => {
  const [newWord, setNewWord] = useState('');
  const [isEditName, setIsEditName] = useState(false);
  const [tempName, setTempName] = useState(category.name);

  return (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        {isEditName ? (
          <input
            className={styles.cardTitleInput}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => { onEditName(tempName); setIsEditName(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onEditName(tempName); setIsEditName(false); }
            }}
            autoFocus
          />
        ) : (
          <span className={styles.contentCardTitle}>
            <i className="ti ti-list" aria-hidden="true" />
            {category.name || `Category ${index + 1}`}
          </span>
        )}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            className={styles.btnEditSmall}
            onClick={() => setIsEditName(true)}
          >
            <i className="ti ti-pencil" aria-hidden="true" /> Edit
          </button>
          <button className={styles.btnDelSmall} onClick={onDelete}>
            <i className="ti ti-trash" aria-hidden="true" /> Delete
          </button>
        </div>
      </div>

      <div className={styles.wordList}>
        {category.words.map((word, wi) => (
          <div key={wi} className={styles.wordRow}>
            <input
              className={styles.wordInput}
              value={word}
              onChange={(e) => onEditWord(wi, e.target.value)}
            />
            <button
              className={styles.btnWordDel}
              onClick={() => onDeleteWord(wi, word)}
              title="Delete"
            >
              <img src="/src/assets/cancel.png" alt="Delete Word" />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.addWordRow}>
        <input
          className={styles.wordInputNew}
          placeholder="+ Add new word/vocabulary..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onAddWord(newWord); setNewWord(''); }
          }}
        />
        <button
          className={styles.btnAddWord}
          onClick={() => { onAddWord(newWord); setNewWord(''); }}
          title="Add"
        >
          <img src="/src/assets/tambah.png" alt="Add" />
        </button>
      </div>
    </div>
  );
};

export default CategoryBlock;
