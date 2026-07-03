import useCollection from '../../hooks/useCollection';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { data: classes, isLoading: loadingKelas } = useCollection('classes');
  const { data: teachers, isLoading: loadingGuru } = useCollection('teachers');
  const { data: students, isLoading: loadingSiswa } = useCollection('students');

  const statItems = [
    { label: 'Total Classes', value: loadingKelas ? '...' : classes.length, key: 'classes' },
    { label: 'Total Teachers', value: loadingGuru ? '...' : teachers.length, key: 'teachers' },
    { label: 'Total Students', value: loadingSiswa ? '...' : students.length, key: 'students' },
    { label: 'Target Completion', value: '0/6', key: 'targets' }, // Placeholder, implement logic later
    { label: 'Overall Progress', value: '0%', key: 'progress' }, // Placeholder, implement logic later
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Data Summary</h2>
        <p className={styles.pageSubtitle}>
          Overview of all input data and target completion status.</p>
      </div>

      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <div key={item.key} className={styles.statCard}>
            <div className={styles.statValue}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.welcomeBanner}>
        <strong>Welcome to Arkan BRIDGE!</strong> Use the menu on the left to manage class, teacher, student, and learning target data. It is recommended to start by filling in the <strong>Class Data</strong> first.
      </div>
    </div>
  );
};

export default DashboardPage;