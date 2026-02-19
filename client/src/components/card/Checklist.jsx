import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import styles from './Checklist.module.css';

function Checklist({
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onDeleteChecklist,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const items = checklist.items || [];
  const total = items.length;
  const done = items.filter((item) => item.completed).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAddItem(checklist._id, trimmed);
    setNewItemText('');
  };

  const handleAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewItemText('');
    }
  };

  return (
    <div className={styles.checklist}>
      <div className={styles.header}>
        <svg className={styles.headerIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2"
            stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 8l2.5 2.5L11 6" stroke="currentColor"
            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h4 className={styles.title}>{checklist.title}</h4>
        <button
          className={styles.deleteBtn}
          onClick={() => onDeleteChecklist(checklist._id)}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className={styles.progressRow}>
        <span className={styles.progressText}>{percent}%</span>
        <div className={styles.progressBar}>
          <div
            className={clsx(styles.progressFill, {
              [styles.progressComplete]: percent === 100,
            })}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div
            key={item._id}
            className={clsx(styles.item, { [styles.itemDone]: item.completed })}
          >
            <button
              className={clsx(styles.checkbox, { [styles.checked]: item.completed })}
              onClick={() => onToggleItem(checklist._id, item._id)}
              type="button"
              aria-label={item.completed ? 'Uncheck item' : 'Check item'}
            >
              {item.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={styles.itemText}>{item.text}</span>
            <button
              className={styles.itemDelete}
              onClick={() => onDeleteItem(checklist._id, item._id)}
              type="button"
              aria-label="Delete item"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
                  strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className={styles.addForm}>
          <input
            ref={inputRef}
            className={styles.addInput}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder="Add an item..."
            type="text"
          />
          <div className={styles.addActions}>
            <button
              className={styles.addBtn}
              onClick={handleAddItem}
              type="button"
              disabled={!newItemText.trim()}
            >
              Add
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => { setIsAdding(false); setNewItemText(''); }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className={styles.addLink}
          onClick={() => setIsAdding(true)}
          type="button"
        >
          Add an item
        </button>
      )}
    </div>
  );
}

export default Checklist;
