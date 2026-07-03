import {
  Document, Page, Text, View, StyleSheet, Image, Font
} from '@react-pdf/renderer';

Font.registerHyphenationCallback((word) => [word])

// ===== COLOR TOKENS =====
const BLUE = '#0F2878';
const CYAN = '#0891B2';
const GRAY = '#64748B';
const LIGHT = '#EFF6FF';
const WHITE = '#FFFFFF';
const BORDER = '#CBD5E1';
const GOLD = '#D97706';
const GOLD_BG = '#FFFBEB';
const GOLD_BORDER = '#FDE68A';

// ===== STYLESHEET =====
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: '#1E293B',
    backgroundColor: WHITE,
  },

  // ===== PAGE NUMBER (fixed - all pages) =====
  pageNumber: {
    position: 'absolute',
    bottom: 18,
    left: 0, right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: GRAY,
  },

  // ===== KOP SURAT (cover page only) =====
  kop: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    paddingBottom: 10,
    alignItems: 'center',
  },
  kopTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  kopSchool: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
    marginTop: 2,
  },
  kopMeta: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
    marginTop: 1,
  },
  kopGrade: {
    marginTop: 6,
    backgroundColor: BLUE,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  kopGradeText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // ===== STUDENT FILL AREA =====
  studentFillWrap: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    backgroundColor: '#FAFBFF',
  },
  studentFillField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  studentFillLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 2,
  },
  studentFillLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
    marginBottom: 2,
  },

  // ===== OVERVIEW ROWS =====
  overviewSection: {
    marginBottom: 8,
  },
  overviewRow: {
    flexDirection: 'row',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
  },
  overviewLabel: {
    width: 120,
    backgroundColor: LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  overviewValue: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontSize: 12,
    color: '#334155',
  },
  overviewEmpty: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // ===== SKILL SUMMARY TABLE (cover page) =====
  skillSummaryTable: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    marginBottom: 10,
  },
  skillSummaryHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillSummaryHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  skillSummaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  skillSummaryLastRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  skillSummarySkillName: {
    width: 80,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    paddingTop: 1,
  },
  skillSummaryDesc: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 1.5,
    paddingRight: 8,
  },
  skillSummaryStarsCol: {
    width: 52,
    alignItems: 'flex-start',
    paddingTop: 1,
  },

  // ===== EMPTY STAR (placeholder for teacher to fill) =====
  emptyStarCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.5,
    borderColor: GOLD,
  },

  // ===== GRADING INDICATOR BOX =====
  gradingWrap: {
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 4,
    backgroundColor: GOLD_BG,
    padding: 8,
    marginBottom: 10,
  },
  gradingTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  gradingColumns: {
    flexDirection: 'row',
    gap: 14,
  },
  gradingBlock: {
    flex: 1,
  },
  gradingBlockTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gradingItem: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 10,
    lineHeight: 1.4,
  },

  // ===== SKILL PAGE TITLE (no kop - only on skill pages) =====
  skillPageTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  skillPageTitleText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 2,
  },
  skillPageTitleSub: {
    marginLeft: 'auto',
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },

  // ===== CHECKBOX =====
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 1.5,
    marginRight: 6,
    flexShrink: 0,
  },

  // ===== LISTENING =====
  listeningGrid: {
    flexDirection: 'column',
    gap: 5,
  },
  listeningWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    minWidth: 90,
  },
  listeningWordText: {
    fontSize: 12,
    color: '#334155',
    paddingRight: 120,
  },

  // ===== SPEAKING (3-column, checkbox per word) =====
  speakingCatRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  speakingCatBlock: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
  },
  speakingCatHeader: {
    backgroundColor: LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 4,
    height: 50,
    justifyContent: 'center',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  speakingCatHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  speakingWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  speakingWordText: {
    fontSize: 12,
    color: '#334155',
  },
  speakingEmpty: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // ===== READING (1-column, checkbox on right) =====
  readingCatBlock: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    marginBottom: 8,
  },
  readingCatMain: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  readingCatHeader: {
    backgroundColor: LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderTopLeftRadius: 2,
  },
  readingCatHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  readingCatBody: {
    padding: 10,
  },
  readingCatText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.7,
  },
  readingCatEmpty: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  readingCheckboxCol: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  // ===== WRITING (table with checkbox on right) =====
  writingStageBlock: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    marginBottom: 8,
  },
  writingHeaderRow: {
    flexDirection: 'row',
    backgroundColor: LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  writingDataRow: {
    flexDirection: 'row',
  },
  wtCellStage: {
    width: 82,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    justifyContent: 'center',
  },
  wtCellOutput: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  wtCellSkill: {
    flex: 1.2,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    justifyContent: 'center',
  },
  wtCellCheckbox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wtHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  wtStageNameText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
  },
  wtWordText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.5,
  },
  wtSkillText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  wtEmpty: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // ===== WRITE DOWN HERE =====
  writeDownHeader: {
    backgroundColor: LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  writeDownHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textAlign: 'center',
  },
  writeDownLine: {
    height: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  writeDownLineLast: {
    height: 18,
  },

  // ===== DIVIDER =====
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginVertical: 6,
  },
});

// ======================================================
// SHARED HELPER COMPONENTS
// ======================================================

/** Kotak checkbox kosong untuk guru ceklis */
const Checkbox = () => <View style={s.checkbox} />;

/** 3 lingkaran kosong sebagai placeholder bintang penilaian fisik */
const StarPlaceholder = () => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[0, 1, 2].map((i) => (
      <Image
        key={i}
        src="/public/assets/black-star.png"  // path relatif dari public folder
        style={{ width: 14, height: 14 }}
      />
    ))}
  </View>
);

/** Nomor halaman, muncul di semua halaman */
const PageFooterFixed = () => (
  <Text
    style={s.pageNumber}
    render={({ pageNumber, totalPages }) =>
      `Page ${pageNumber} of ${totalPages}  |  Arkan BRIDGE (Bilingual Report and Interactive Digital Guide for Education)`
    }
    fixed
  />
);

// ======================================================
// COVER PAGE COMPONENTS
// ======================================================

const KopSurat = ({ semester, tahunAjaran, kelasNumber }) => (
  <View style={s.kop}>
    <Text style={s.kopTitle}>
      TARGET PENCAPAIAN BILINGUAL SEMESTER {semester}
    </Text>
    <Text style={s.kopSchool}>SDIT ARKAN CENDEKIA</Text>
    <Text style={s.kopMeta}>TAHUN AJARAN {tahunAjaran}</Text>
    <View style={s.kopGrade}>
      <Text style={s.kopGradeText}>{kelasNumber}</Text>
    </View>
  </View>
);

const StudentFillArea = () => (
  <View style={s.studentFillWrap}>
    <View style={s.studentFillField}>
      <Text style={s.studentFillLabel}>Name :</Text>
      <View style={s.studentFillLine} />
    </View>
    <View style={s.studentFillField}>
      <Text style={s.studentFillLabel}>Class :</Text>
      <View style={s.studentFillLine} />
    </View>
  </View>
);

const OverviewRow = ({ label, value }) => (
  <View style={s.overviewRow}>
    <Text style={s.overviewLabel}>{label}</Text>
    {value?.trim()
      ? <Text style={s.overviewValue}>{value}</Text>
      : <Text style={s.overviewEmpty}>Not filled yet</Text>
    }
  </View>
);

/** Tabel ringkasan 4 skill + star placeholder + deskripsi */
const SkillSummarySection = ({ kelasData }) => {
  const SKILLS = [
    { num: '1', name: 'Listening', key: 'listening' },
    { num: '2', name: 'Speaking', key: 'speaking' },
    { num: '3', name: 'Reading', key: 'reading' },
    { num: '4', name: 'Writing', key: 'writing' },
  ];

  return (
    <View style={s.skillSummaryTable}>
      {/* Header */}
      <View style={s.skillSummaryHeader}>
        <Text style={[s.skillSummaryHeaderText, { width: 80 }]}>Skill</Text>
        <Text style={[s.skillSummaryHeaderText, { flex: 1 }]}>
          Target Description
        </Text>
        <Text style={[s.skillSummaryHeaderText, { width: 52 }]}>
          Stars
        </Text>
      </View>

      {/* Rows */}
      {SKILLS.map((skill, i) => {
        const desc = kelasData[skill.key]?.description;
        const isLast = i === SKILLS.length - 1;
        return (
          <View
            key={skill.key}
            style={isLast ? s.skillSummaryLastRow : s.skillSummaryRow}
          >
            <Text style={s.skillSummarySkillName}>
              {skill.num}. {skill.name}
            </Text>
            <Text style={s.skillSummaryDesc}>
              {desc?.trim() || '(there is no description)'}
            </Text>
            <View style={s.skillSummaryStarsCol}>
              <StarPlaceholder />
            </View>
          </View>
        );
      })}
    </View>
  );
};

/** Kotak kuning indikator penilaian di bawah cover page */
const GradingIndicatorNote = () => (
  <View style={s.gradingWrap}>
    <Text style={s.gradingTitle}>Skill Grading Indicator</Text>
    <View style={s.gradingColumns}>
      {/* Bintang Penilaian */}
      <View style={s.gradingBlock}>
        <Text style={s.gradingItem}>
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          : Student still needs guidance
        </Text>
        <Text style={s.gradingItem}>
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          : Student is already able to understand the material without guidance
        </Text>
        <Text style={s.gradingItem}>
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          <Image src="/public/assets/star.png" style={{ width: 14, height: 14 }} />
          : Student is able to understand the material in a structured and independent manner
        </Text>
      </View>
    </View>
  </View>
);

const GradingBonusStars = () => (
  <View style={s.gradingWrap}>
    <Text style={s.gradingTitle}>Bonus Stars</Text>
    <View style={s.gradingColumns}>
      {/* Bintang Penilaian */}
      <View style={s.gradingBlock}>
        <Text style={s.gradingItem}>
          Listening & Speaking : if 5 words completed, student will get 1 star
        </Text>
        <Text style={s.gradingItem}>
          Reading : +1 star for completing the task & +2 stars for completing with clearly per category
        </Text>
        <Text style={s.gradingItem}>
          Writing : +1 star for completing the stage & +2 stars for completing in a structured manner per stage
        </Text>
      </View>
    </View>
  </View>
);

/** Halaman pertama per kelas — kop surat, overview, skill summary, indikator */
const CoverPage = ({ kelasData, semester, tahunAjaran }) => (
  <Page size="A4" style={s.page}>
    <KopSurat
      semester={semester}
      tahunAjaran={tahunAjaran}
      kelasNumber={kelasData.kelasNumber}
    />
    <StudentFillArea />
    <View style={s.overviewSection}>
      <OverviewRow label="Main Focus" value={kelasData.fokusUtama} />
      <OverviewRow label="English Classroom" value={kelasData.outputDiKelas} />
      <OverviewRow label="Applied in Use" value={kelasData.outputPembelajaran} />
    </View>
    <SkillSummarySection kelasData={kelasData} />
    <GradingIndicatorNote />
    <GradingBonusStars />
    <PageFooterFixed />
  </Page>
);

// ======================================================
// SKILL PAGE SHARED TITLE (no kop surat)
// ======================================================

/** Header skill page sederhana — tanpa kop surat */
const SkillPageTitle = ({ number, name, kelasNumber }) => (
  <View style={s.skillPageTitle}>
    <Text style={s.skillPageTitleText}>
      {number}. {name.toUpperCase()}
    </Text>
    <Text style={s.skillPageTitleSub}>{kelasNumber}</Text>
  </View>
);

// ======================================================
// SKILL PAGES
// ======================================================

/**
 * LISTENING — kosakata dalam grid chip, tiap chip ada checkbox
 * Jika kosakata banyak, react-pdf otomatis lanjut ke halaman berikutnya
 */
const ListeningSkillPage = ({ data = {}, kelasNumber }) => {
  const words = data.words ?? [];
  return (
    <Page size="A4" style={s.page}>
      <SkillPageTitle number="1" name="Listening" kelasNumber={kelasNumber} />
      {words.length === 0 ? (
        <Text style={{ fontSize: 7.5, color: '#94A3B8', fontStyle: 'italic' }}>
          There is no vocabulary.
        </Text>
      ) : (
        <View style={s.listeningGrid}>
          {words.map((word, i) => (
            <View key={i} style={s.listeningWordItem}>
              <Text style={s.listeningWordText}>{word}</Text>
              <Checkbox />
            </View>
          ))}
        </View>
      )}
      <PageFooterFixed />
    </Page>
  );
};

/**
 * SPEAKING — 3 kolom per baris, tiap kata ada checkbox
 * wrap={false} per baris supaya 1 baris (3 kategori) tidak terpotong
 */
const SpeakingSkillPage = ({ data = {}, kelasNumber }) => {
  const categories = data.categories ?? [];

  // Kelompokkan 3 kategori per baris
  const rows = [];
  for (let i = 0; i < categories.length; i += 3) {
    rows.push(categories.slice(i, i + 3));
  }

  return (
    <Page size="A4" style={s.page}>
      <SkillPageTitle number="2" name="Speaking" kelasNumber={kelasNumber} />
      {categories.length === 0 ? (
        <Text style={{ fontSize: 7.5, color: '#94A3B8', fontStyle: 'italic' }}>
          There is no category.
        </Text>
      ) : rows.map((rowCats, ri) => (
        <View key={ri} style={s.speakingCatRow} wrap={false}>
          {rowCats.map((cat, ci) => (
            <View key={ci} style={s.speakingCatBlock} wrap={false}>
              <View style={s.speakingCatHeader}>
                <Text style={s.speakingCatHeaderText}>
                  {cat.name || `Category ${ci + 1}`}
                </Text>
              </View>
              {(cat.words ?? []).length === 0 ? (
                <Text style={s.speakingEmpty}>There is no vocabulary</Text>
              ) : (cat.words ?? []).map((word, wi) => (
                <View key={wi} style={s.speakingWordItem}>
                  <Checkbox />
                  <Text style={s.speakingWordText}>{word}</Text>
                </View>
              ))}
            </View>
          ))}
          {/* Placeholder kolom kosong supaya lebar konsisten */}
          {Array.from({ length: 3 - rowCats.length }).map((_, ei) => (
            <View key={`ph-${ei}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
      <PageFooterFixed />
    </Page>
  );
};

/**
 * READING — 1 kategori per baris (full width), checkbox di kolom kanan
 * Support 2 tipe konten kategori:
 *   - content (string) → teks paragraf/dialog (kelas 2-6)
 *   - words  (array)   → list kosakata (fallback / kelas 1)
 */
const ReadingSkillPage = ({ data = {}, kelasNumber }) => {
  const categories = data.categories ?? [];
  return (
    <Page size="A4" style={s.page}>
      <SkillPageTitle number="3" name="Reading" kelasNumber={kelasNumber} />
      {categories.length === 0 ? (
        <Text style={{ fontSize: 7.5, color: '#94A3B8', fontStyle: 'italic' }}>
          There is no category.
        </Text>
      ) : categories.map((cat, ci) => (
        <View key={ci} style={s.readingCatBlock} wrap={false}>
          {/* Konten kategori */}
          <View style={s.readingCatMain}>
            <View style={s.readingCatHeader}>
              <Text style={s.readingCatHeaderText}>
                {cat.name || `Category ${ci + 1}`}
              </Text>
            </View>
            <View style={s.readingCatBody}>
              {cat.content?.trim() ? (
                /* Mode teks paragraf / dialog */
                <Text style={s.readingCatText}>{cat.content}</Text>
              ) : (cat.words ?? []).length > 0 ? (
                /* Fallback: word list */
                (cat.words ?? []).map((word, wi) => (
                  <Text key={wi} style={s.readingCatText}>{word}</Text>
                ))
              ) : (
                <Text style={s.readingCatEmpty}>There is no content</Text>
              )}
            </View>
          </View>

          {/* Kolom checkbox di kanan */}
          <View style={s.readingCheckboxCol}>
            <Checkbox />
          </View>
        </View>
      ))}
      <PageFooterFixed />
    </Page>
  );
};

/**
 * WRITING — tabel per stage dengan kolom checkbox di kanan
 * wrap={false} per stage supaya satu stage tidak terpotong antar halaman
 */
const WritingSkillPage = ({ data = {}, kelasNumber }) => {
  const stages = data.stages ?? [];
  return (
    <Page size="A4" style={s.page}>
      <SkillPageTitle number="4" name="Writing" kelasNumber={kelasNumber} />
      {stages.length === 0 ? (
        <Text style={{ fontSize: 7.5, color: '#94A3B8', fontStyle: 'italic' }}>
          There is no stage.
        </Text>
      ) : stages.map((stage, si) => (
        <View key={si} style={s.writingStageBlock} wrap={false}>
          {/* Header row */}
          <View style={s.writingHeaderRow}>
            <View style={s.wtCellStage}>
              <Text style={s.wtHeaderText}>Stage</Text>
            </View>
            <View style={s.wtCellOutput}>
              <Text style={s.wtHeaderText}>Output Targets</Text>
            </View>
            <View style={s.wtCellSkill}>
              <Text style={s.wtHeaderText}>Skill Targets</Text>
            </View>
            <View style={s.wtCellCheckbox}>
              <Text style={s.wtHeaderText}>
                <Image src="/public/assets/ceklis.png" alt="Checklist" />
              </Text>
            </View>
          </View>

          {/* Data row */}
          <View style={s.writingDataRow}>
            <View style={s.wtCellStage}>
              <Text style={s.wtStageNameText}>
                {stage.name || `Stage ${si + 1}`}
              </Text>
            </View>
            <View style={s.wtCellOutput}>
              {(stage.words ?? []).length === 0 ? (
                <Text style={s.wtEmpty}>There is no vocabulary</Text>
              ) : (stage.words ?? []).map((word, wi) => (
                <Text key={wi} style={s.wtWordText}>• {word}</Text>
              ))}
            </View>
            <View style={s.wtCellSkill}>
              <Text style={s.wtSkillText}>
                {stage.skillYangDicapai?.trim() || '(Not filled yet)'}
              </Text>
            </View>
            <View style={s.wtCellCheckbox}>
              <Checkbox />
            </View>
          </View>

          {/* Write down here */}
          <View style={s.writeDownHeader}>
            <Text style={s.writeDownHeaderText}>Write down here</Text>
          </View>
          {Array.from({ length: 5 }).map((_, li) => (
            <View
              key={li}
              style={li < 4 ? s.writeDownLine : s.writeDownLineLast}
            />
          ))}
        </View>
      ))}
      <PageFooterFixed />
    </Page>
  );
};

// ======================================================
// PER-KELAS PAGES ASSEMBLY
// ======================================================

/**
 * Satu kelas = 5 page minimum:
 *   Page 1 : Cover (kop surat + overview + skill summary + indikator)
 *   Page 2+: Listening
 *   Page X+: Speaking
 *   Page Y+: Reading
 *   Page Z+: Writing
 */
const KelasPages = ({ kelasData, semester, tahunAjaran }) => (
  <>
    <CoverPage
      kelasData={kelasData}
      semester={semester}
      tahunAjaran={tahunAjaran}
    />
    <ListeningSkillPage
      data={kelasData.listening}
      kelasNumber={kelasData.kelasNumber}
    />
    <SpeakingSkillPage
      data={kelasData.speaking}
      kelasNumber={kelasData.kelasNumber}
    />
    <ReadingSkillPage
      data={kelasData.reading}
      kelasNumber={kelasData.kelasNumber}
    />
    <WritingSkillPage
      data={kelasData.writing}
      kelasNumber={kelasData.kelasNumber}
    />
  </>
);

// ======================================================
// MAIN DOCUMENT
// ======================================================

const ReportTemplate = ({ reportData = [], semester, tahunAjaran }) => (
  <Document
    title={`Laporan Target Bilingual Semester ${semester} TA ${tahunAjaran}`}
    author="Arkan Bridge"
    subject="Target Pencapaian Bilingual"
  >
    {reportData.map((kelasData) => (
      <KelasPages
        key={kelasData.kelasNumber}
        kelasData={kelasData}
        semester={semester}
        tahunAjaran={tahunAjaran}
      />
    ))}
  </Document>
);

export default ReportTemplate;