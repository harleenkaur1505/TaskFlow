import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.illustration}>
        <div className={styles.card} />
        <div className={styles.cardCenter}>
          <span>?</span>
        </div>
        <div className={styles.card} />
      </div>

      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Page not found</h2>
      <p className={styles.text}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <button
        className={styles.btn}
        onClick={() => navigate('/boards')}
        type="button"
      >
        Back to boards
      </button>

      <span className={styles.brand}>TaskFlow</span>
    </div>
  );
}

export default NotFound;
