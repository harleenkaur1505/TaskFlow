import clsx from 'clsx';
import styles from './Input.module.css';

function Input({
  label,
  error,
  icon: Icon,
  id,
  ...props
}) {
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {Icon && <Icon className={styles.icon} size={18} />}
        <input
          id={id}
          className={clsx(styles.input, {
            [styles.hasIcon]: Icon,
            [styles.hasError]: error,
          })}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default Input;
