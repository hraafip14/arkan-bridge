import { useState } from 'react';
import styles from './AturTargetPage.module.css';

const StageBlock = ({
  index, stage, onEditName, onDelete,
  onAddWord, onDeleteWord, onEditSkill,
}) => {
  const [newWord,    setNewWord]    = useState('');
  const [isEditName, setIsEditName] = useState(false);
  const [tempName,   setTempName]   = useState(stage.name);

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
            <i className="ti ti-layers" aria-hidden="true" />
            {stage.name || `Stage ${index + 1}`}
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

      {/* Vocabulary list */}
      <div className={styles.wordList}>
        {stage.words.map((word, wi) => (
          <div key={wi} className={styles.wordRow}>
            <span className={styles.wordText}>{word}</span>
            <button
              className={styles.btnWordDel}
              onClick={() => onDeleteWord(wi, word)}
              title="Delete"
            >
              <img src="/assets/cancel.png" alt="Delete Word" />
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
          <img src="/assets/tambah.png" alt="Add Word" />
        </button>
      </div>

      {/* Expected skill achieved */}
      <div className={styles.skillAchieveWrap}>
        <label className={styles.skillAchieveLabel}>
          <i className="ti ti-award" aria-hidden="true" />
          Expected skill achieved at this stage
        </label>
        <input
          className={styles.skillAchieveInput}
          placeholder="e.g: Students can copy capital letters"
          value={stage.skillYangDicapai ?? ''}
          onChange={(e) => onEditSkill(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StageBlock;
