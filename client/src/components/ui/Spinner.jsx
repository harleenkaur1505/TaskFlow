import styles from './Spinner.module.css';

function Spinner({ size = 32 }) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.spinner}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default Spinner;
