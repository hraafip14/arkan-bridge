import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/common/ConfirmModal';
import CategoryBlock from './CategoryBlock';
import ReadingCategoryBlock from './ReadingCategoryBlock';
import StageBlock from './StageBlock';
import { saveTargetSkill } from './targetsService';
import styles from './AturTargetPage.module.css';

const SKILL_DESC_PLACEHOLDER = {
  listening: 'e.g: Students in this class are expected to understand basic instructions...',
  speaking:  'e.g: Students in this class are expected to greet and name objects...',
  reading:   'e.g: Students in this class are expected to read short paragraphs...',
  writing:   'e.g: Students in this class are expected to copy words...',
};

const SkillEditor = ({
  kelasNumber,
  skillKey,
  initialData,
  onSaved,
  onDirtyChange,
  saveRequested,
  showToast,
}) => {
  const [description,          setDescription]          = useState(initialData.description ?? '');
  const [isEditDesc,           setIsEditDesc]           = useState(false);
  const [isSaving,             setIsSaving]             = useState(false);
  const [listeningWords,       setListeningWords]       = useState(initialData.words ?? []);
  const [listeningCategoryName, setListeningCategoryName] = useState(initialData.categoryName ?? 'Semester 1');
  const [isEditListeningCat,   setIsEditListeningCat]   = useState(false);
  const [newListeningWord,     setNewListeningWord]     = useState('');
  const [categories,           setCategories]           = useState(initialData.categories ?? []);
  const [newCatName,           setNewCatName]           = useState('');
  const [categorySearch,       setCategorySearch]       = useState('');
  const [stages,               setStages]               = useState(initialData.stages ?? []);
  const [newStageName,         setNewStageName]         = useState('');
  const [stageSearch,          setStageSearch]          = useState('');
  const [deleteTarget,         setDeleteTarget]         = useState(null);

  // Reset semua state saat skillKey berubah (ganti tab)
  useEffect(() => {
    setDescription(initialData.description ?? '');
    setIsEditDesc(false);
    setListeningWords(initialData.words ?? []);
    setListeningCategoryName(initialData.categoryName ?? 'Semester 1');
    setIsEditListeningCat(false);
    setCategories(initialData.categories ?? []);
    setStages(initialData.stages ?? []);
    setNewListeningWord('');
    setNewCatName('');
    setNewStageName('');
    setCategorySearch('');
    setStageSearch('');
    onDirtyChange(false);
  }, [skillKey]);

  // ===== Dirty tracking =====
  const markDirty = () => onDirtyChange(true);
  const setDescriptionDirty    = (val) => { setDescription(val);    markDirty(); };
  const setListeningWordsDirty = (val) => { setListeningWords(val); markDirty(); };
  const setListeningCategoryNameDirty = (val) => { setListeningCategoryName(val); markDirty(); };
  const setCategoriesDirty     = (val) => { setCategories(val);     markDirty(); };
  const setStagesDirty         = (val) => { setStages(val);         markDirty(); };

  // ===== Build payload sesuai skill =====
  const buildPayload = () => {
    const base = { description };
    if (skillKey === 'listening')                            return { ...base, words: listeningWords, categoryName: listeningCategoryName };
    if (skillKey === 'speaking' || skillKey === 'reading')  return { ...base, categories };
    if (skillKey === 'writing')                             return { ...base, stages };
    return base;
  };

  // ===== Save =====
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload();
      await saveTargetSkill(kelasNumber, skillKey, payload);
      onSaved(skillKey, payload);
      showToast(`${kelasNumber} ${skillKey} data saved successfully!`);
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Dipanggil dari SkillDetailPanel saat user pilih "Save Data" di modal tab
  useEffect(() => {
    if (saveRequested) handleSaveAll();
  }, [saveRequested]);

  // ===== Listening helpers =====
  const addListeningWord = () => {
    if (!newListeningWord.trim()) return;
    setListeningWordsDirty([...listeningWords, newListeningWord.trim()]);
    setNewListeningWord('');
  };
  const requestDeleteListeningWord = (idx, word) => {
    setDeleteTarget({ type: 'listeningWord', idx, label: word });
  };
  const editListeningWord = (idx, val) =>
    setListeningWordsDirty(listeningWords.map((w, i) => (i === idx ? val : w)));

  // ===== Category helpers (Speaking & Reading) =====
  const addCategory = () => {
    if (!newCatName.trim()) return;
    // Reading: { name, content: '' } | Speaking: { name, words: [] }
    const newCat = skillKey === 'reading'
      ? { name: newCatName.trim(), content: '' }
      : { name: newCatName.trim(), words: [] };
    setCategoriesDirty([...categories, newCat]);
    setNewCatName('');
  };
  const requestDeleteCategory = (ci, name) => {
    setDeleteTarget({ type: 'category', idx: ci, label: name || `Category ${ci + 1}` });
  };
  const editCategoryName = (ci, val) =>
    setCategoriesDirty(categories.map((cat, i) => (i === ci ? { ...cat, name: val } : cat)));

  // Speaking: edit content via word list
  const addWordToCategory = (ci, word) => {
    if (!word.trim()) return;
    setCategoriesDirty(
      categories.map((cat, i) =>
        i === ci ? { ...cat, words: [...cat.words, word.trim()] } : cat
      )
    );
  };
  const requestDeleteCategoryWord = (ci, wi, word) => {
    setDeleteTarget({ type: 'categoryWord', ci, wi, label: word });
  };
  const editWordInCategory = (ci, wi, val) =>
    setCategoriesDirty(
      categories.map((cat, i) =>
        i === ci
          ? { ...cat, words: cat.words.map((w, j) => (j === wi ? val : w)) }
          : cat
      )
    );

  // Reading: edit content field (teks paragraf / dialog)
  const editCategoryContent = (ci, val) =>
    setCategoriesDirty(
      categories.map((cat, i) => (i === ci ? { ...cat, content: val } : cat))
    );

  // ===== Stage helpers (Writing) =====
  const addStage = () => {
    if (!newStageName.trim()) return;
    setStagesDirty([...stages, { name: newStageName.trim(), words: [], skillYangDicapai: '' }]);
    setNewStageName('');
  };
  const requestDeleteStage = (si, name) => {
    setDeleteTarget({ type: 'stage', idx: si, label: name || `Stage ${si + 1}` });
  };
  const editStageName = (si, val) =>
    setStagesDirty(stages.map((s, i) => (i === si ? { ...s, name: val } : s)));
  const editSkillYangDicapai = (si, val) =>
    setStagesDirty(stages.map((s, i) => (i === si ? { ...s, skillYangDicapai: val } : s)));
  const addWordToStage = (si, word) => {
    if (!word.trim()) return;
    setStagesDirty(
      stages.map((s, i) =>
        i === si ? { ...s, words: [...s.words, word.trim()] } : s
      )
    );
  };
  const requestDeleteStageWord = (si, wi, word) => {
    setDeleteTarget({ type: 'stageWord', si, wi, label: word });
  };

  // ===== Confirm delete handler =====
  const handleDeleteConfirm = () => {
    const t = deleteTarget;
    if (!t) return;

    if (t.type === 'listeningWord') {
      setListeningWordsDirty(listeningWords.filter((_, i) => i !== t.idx));
    } else if (t.type === 'category') {
      setCategoriesDirty(categories.filter((_, i) => i !== t.idx));
    } else if (t.type === 'categoryWord') {
      setCategoriesDirty(
        categories.map((cat, i) =>
          i === t.ci
            ? { ...cat, words: cat.words.filter((_, j) => j !== t.wi) }
            : cat
        )
      );
    } else if (t.type === 'stage') {
      setStagesDirty(stages.filter((_, i) => i !== t.idx));
    } else if (t.type === 'stageWord') {
      setStagesDirty(
        stages.map((s, i) =>
          i === t.si
            ? { ...s, words: s.words.filter((_, j) => j !== t.wi) }
            : s
        )
      );
    }

    setDeleteTarget(null);
  };

  const deleteModalConfig = deleteTarget ? {
    listeningWord : { title: 'Delete Vocabulary?', message: `"${deleteTarget.label}" will be removed from the vocabulary list.` },
    category      : { title: 'Delete Category?',   message: `Category "${deleteTarget.label}" and all its content will be permanently deleted.` },
    categoryWord  : { title: 'Delete Vocabulary?', message: `"${deleteTarget.label}" will be removed from this category.` },
    stage         : { title: 'Delete Stage?',      message: `Stage "${deleteTarget.label}" and all its content will be permanently deleted.` },
    stageWord     : { title: 'Delete Vocabulary?', message: `"${deleteTarget.label}" will be removed from this stage.` },
  }[deleteTarget.type] : null;

  return (
    <>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title={deleteModalConfig?.title ?? 'Delete?'}
        message={deleteModalConfig?.message ?? ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className={styles.skillEditor}>
        {/* Description card */}
        <div className={styles.descCard}>
          <div className={styles.descCardHeader}>
            <span className={styles.descLabel}>
              <i className="ti ti-file-description" aria-hidden="true" />
              Target {skillKey.charAt(0).toUpperCase() + skillKey.slice(1)} description
            </span>
            {!isEditDesc && (
              <button className={styles.btnEditSmall} onClick={() => setIsEditDesc(true)}>
                <i className="ti ti-pencil" aria-hidden="true" /> Edit
              </button>
            )}
          </div>
          {isEditDesc ? (
            <textarea
              className={styles.descTextarea}
              placeholder={SKILL_DESC_PLACEHOLDER[skillKey]}
              value={description}
              onChange={(e) => setDescriptionDirty(e.target.value)}
              rows={3}
            />
          ) : (
            <p className={styles.descValue}>
              {description || (
                <span className={styles.overviewEmpty}>
                  There is no description yet. Click <strong>edit</strong> to fill in.
                </span>
              )}
            </p>
          )}
          {isEditDesc && (
            <button
              className={styles.btnEditSmall}
              style={{ marginTop: '0.5rem' }}
              onClick={() => setIsEditDesc(false)}
            >
              <i className="ti ti-check" aria-hidden="true" /> Done
            </button>
          )}
        </div>

        {/* ===== LISTENING ===== */}
        {skillKey === 'listening' && (
          <div className={styles.contentCard}>
            <div className={styles.contentCardHeader}>
              {isEditListeningCat ? (
                <input
                  className={styles.cardTitleInput}
                  value={listeningCategoryName}
                  onChange={(e) => setListeningCategoryNameDirty(e.target.value)}
                  onBlur={() => setIsEditListeningCat(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditListeningCat(false);
                  }}
                  autoFocus
                />
              ) : (
                <span className={styles.contentCardTitle}>
                  <i className="ti ti-list" aria-hidden="true" />
                  {listeningCategoryName}
                </span>
              )}
              {!isEditListeningCat && (
                <button
                  className={styles.btnEditSmall}
                  onClick={() => setIsEditListeningCat(true)}
                >
                  <i className="ti ti-pencil" aria-hidden="true" /> Edit
                </button>
              )}
            </div>
            <div className={styles.wordList}>
              {listeningWords.map((word, idx) => (
                <div key={idx} className={styles.wordRow}>
                  <input
                    className={styles.wordInput}
                    value={word}
                    onChange={(e) => editListeningWord(idx, e.target.value)}
                  />
                  <button
                    className={styles.btnWordDel}
                    onClick={() => requestDeleteListeningWord(idx, word)}
                    title="Delete"
                  >
                    <img src="/assets/cancel.png" alt="Delete" />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.addWordRow}>
              <input
                className={styles.wordInputNew}
                placeholder="+ add new word/vocabulary..."
                value={newListeningWord}
                onChange={(e) => setNewListeningWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addListeningWord()}
              />
              <button className={styles.btnAddWord} onClick={addListeningWord}>
                <img src="/assets/tambah.png" alt="Add Word" />
              </button>
            </div>
          </div>
        )}

        {/* ===== SPEAKING — word list per kategori (3 kolom di PDF) ===== */}
        {skillKey === 'speaking' && (
          <div>
            {/* Category search */}
            {categories.length > 0 && (
              <div className={styles.categorySearchWrap}>
                <i className="ti ti-search" aria-hidden="true" />
                <input
                  type="text"
                  list="speaking-categories"
                  className={styles.categorySearchInput}
                  placeholder="Search name category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <datalist id="speaking-categories">
                  {categories.map((c, i) => (
                    <option key={i} value={c.name} />
                  ))}
                </datalist>
                {categorySearch && (
                  <button
                    className={styles.categorySearchClear}
                    onClick={() => setCategorySearch('')}
                    title="Remove search"
                  >
                    X
                  </button>
                )}
              </div>
            )}

            <div className={styles.addCatRow}>
              <input
                className={styles.addCatInput}
                placeholder="New category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <button className={styles.btnAddCat} onClick={addCategory}>
                <i className="ti ti-plus" aria-hidden="true" /> Add Category
              </button>
            </div>

            {/* Category list (filtered) */}
            {(() => {
              const filtered = categories
                .map((cat, originalIndex) => ({ cat, originalIndex }))
                .filter(({ cat }) =>
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
                );

              return filtered.length === 0 && categorySearch ? (
                <div className={styles.categorySearchEmpty}>
                  <i className="ti ti-mood-sad" aria-hidden="true" />
                  Kategori "{categorySearch}" tidak ditemukan.
                </div>
              ) : (
                <div className={styles.categoryGrid}>
                  {filtered.map(({ cat, originalIndex: ci }) => (
                    <CategoryBlock
                      key={ci}
                      index={ci}
                      category={cat}
                      onEditName={(val) => editCategoryName(ci, val)}
                      onDelete={() => requestDeleteCategory(ci, cat.name)}
                      onAddWord={(word) => addWordToCategory(ci, word)}
                      onDeleteWord={(wi) => requestDeleteCategoryWord(ci, wi, cat.words[wi])}
                      onEditWord={(wi, val) => editWordInCategory(ci, wi, val)}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== READING — teks paragraf / dialog per kategori ===== */}
        {skillKey === 'reading' && (
          <div>
            {/* Category search */}
            {categories.length > 0 && (
              <div className={styles.categorySearchWrap}>
                <i className="ti ti-search" aria-hidden="true" />
                <input
                  type="text"
                  list="reading-categories"
                  className={styles.categorySearchInput}
                  placeholder="Search name category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <datalist id="reading-categories">
                  {categories.map((c, i) => (
                    <option key={i} value={c.name} />
                  ))}
                </datalist>
                {categorySearch && (
                  <button
                    className={styles.categorySearchClear}
                    onClick={() => setCategorySearch('')}
                    title="Remove search"
                  >
                    X
                  </button>
                )}
              </div>
            )}

            <div className={styles.addCatRow}>
              <input
                className={styles.addCatInput}
                placeholder="New category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <button className={styles.btnAddCat} onClick={addCategory}>
                <i className="ti ti-plus" aria-hidden="true" /> Add Category
              </button>
            </div>

            {/* ReadingCategoryBlock list (filtered) */}
            {(() => {
              const filtered = categories
                .map((cat, originalIndex) => ({ cat, originalIndex }))
                .filter(({ cat }) =>
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
                );

              return filtered.length === 0 && categorySearch ? (
                <div className={styles.categorySearchEmpty}>
                  <i className="ti ti-mood-sad" aria-hidden="true" />
                  Kategori "{categorySearch}" tidak ditemukan.
                </div>
              ) : (
                filtered.map(({ cat, originalIndex: ci }) => (
                  <ReadingCategoryBlock
                    key={ci}
                    index={ci}
                    category={cat}
                    onEditName={(val) => editCategoryName(ci, val)}
                    onDelete={() => requestDeleteCategory(ci, cat.name)}
                    onEditContent={(val) => editCategoryContent(ci, val)}
                  />
                ))
              );
            })()}
          </div>
        )}

        {/* ===== WRITING ===== */}
        {skillKey === 'writing' && (
          <div>
            {/* Stage search */}
            {stages.length > 0 && (
              <div className={styles.categorySearchWrap}>
                <i className="ti ti-search" aria-hidden="true" />
                <input
                  type="text"
                  list="writing-stages"
                  className={styles.categorySearchInput}
                  placeholder="Cari nama stage..."
                  value={stageSearch}
                  onChange={(e) => setStageSearch(e.target.value)}
                />
                <datalist id="writing-stages">
                  {stages.map((s, i) => (
                    <option key={i} value={s.name} />
                  ))}
                </datalist>
                {stageSearch && (
                  <button
                    className={styles.categorySearchClear}
                    onClick={() => setStageSearch('')}
                    title="Remove search"
                  >
                    X
                  </button>
                )}
              </div>
            )}

            <div className={styles.addCatRow}>
              <input
                className={styles.addCatInput}
                placeholder="New stage name..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStage()}
              />
              <button className={styles.btnAddCat} onClick={addStage}>
                <i className="ti ti-plus" aria-hidden="true" /> Add new stage
              </button>
            </div>

            {/* Stage list (filtered) */}
            {(() => {
              const filtered = stages
                .map((stage, originalIndex) => ({ stage, originalIndex }))
                .filter(({ stage }) =>
                  stage.name.toLowerCase().includes(stageSearch.toLowerCase().trim())
                );

              return filtered.length === 0 && stageSearch ? (
                <div className={styles.categorySearchEmpty}>
                  <i className="ti ti-mood-sad" aria-hidden="true" />
                  Stage "{stageSearch}" tidak ditemukan.
                </div>
              ) : (
                filtered.map(({ stage, originalIndex: si }) => (
                  <StageBlock
                    key={si}
                    index={si}
                    stage={stage}
                    onEditName={(val) => editStageName(si, val)}
                    onDelete={() => requestDeleteStage(si, stage.name)}
                    onAddWord={(word) => addWordToStage(si, word)}
                    onDeleteWord={(wi) => requestDeleteStageWord(si, wi, stage.words[wi])}
                    onEditSkill={(val) => editSkillYangDicapai(si, val)}
                  />
                ))
              );
            })()}
          </div>
        )}

        {/* Save All button
        <div className={styles.tabBtnSaveAll}>
          <button
            className={styles.btnSaveAll}
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            <img src="/assets/save.png" alt="Save" />
            {isSaving
              ? 'Saving...'
              : `Save`}
          </button>
        </div>*/}
      </div>
    </>
  );
};

export default SkillEditor;