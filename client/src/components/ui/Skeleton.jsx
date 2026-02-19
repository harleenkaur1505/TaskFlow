import styles from './Skeleton.module.css';

function Skeleton({ width, height, borderRadius, style }) {
  return (
    <div
      className={styles.skeleton}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: borderRadius || 'var(--border-radius-sm)',
        ...style,
      }}
    />
  );
}

function BoardsSkeleton() {
  return (
    <div className={styles.boardsGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={styles.boardCard}>
          <Skeleton height="100%" borderRadius="var(--border-radius-sm)" />
        </div>
      ))}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className={styles.boardView}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.listSkeleton}>
          <Skeleton height="20px" width="120px" style={{ marginBottom: '12px' }} />
          <Skeleton height="52px" style={{ marginBottom: '8px' }} />
          <Skeleton height="52px" style={{ marginBottom: '8px' }} />
          {i < 3 && <Skeleton height="52px" style={{ marginBottom: '8px' }} />}
          <Skeleton height="32px" width="100px" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
export { BoardsSkeleton, BoardSkeleton };
