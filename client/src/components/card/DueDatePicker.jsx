import { useState, useRef, useEffect } from 'react';
import { format, isPast, isToday, addDays } from 'date-fns';
import clsx from 'clsx';
import styles from './DueDatePicker.module.css';

function DueDatePicker({ dueDate, dueComplete, onSave, onToggleComplete, onRemove, onClose }) {
  const [dateValue, setDateValue] = useState(
    dueDate ? format(new Date(dueDate), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  );
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = () => {
    if (dateValue) {
      onSave(new Date(dateValue).toISOString());
    }
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  return (
    <div className={styles.picker} ref={pickerRef}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Due Date</span>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        <label className={styles.label} htmlFor="dueDateInput">Date</label>
        <input
          id="dueDateInput"
          type="date"
          className={styles.dateInput}
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
        />

        {dueDate && (
          <div className={styles.statusRow}>
            <button
              className={clsx(styles.completeBtn, {
                [styles.completeBtnDone]: dueComplete,
              })}
              onClick={onToggleComplete}
              type="button"
            >
              <span className={clsx(styles.checkbox, { [styles.checkboxChecked]: dueComplete })}>
                {dueComplete && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {dueComplete ? 'Complete' : 'Mark complete'}
            </button>
            {(() => {
              const d = new Date(dueDate);
              const overdue = !dueComplete && isPast(d) && !isToday(d);
              const soon = !dueComplete && isToday(d);
              const complete = dueComplete;
              if (complete) return <span className={clsx(styles.badge, styles.badgeComplete)}>Complete</span>;
              if (overdue) return <span className={clsx(styles.badge, styles.badgeOverdue)}>Overdue</span>;
              if (soon) return <span className={clsx(styles.badge, styles.badgeSoon)}>Due today</span>;
              return null;
            })()}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave} type="button">
            Save
          </button>
          {dueDate && (
            <button className={styles.removeBtn} onClick={handleRemove} type="button">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DueDatePicker;
