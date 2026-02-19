import { useState, useRef, useEffect } from 'react';
import styles from './CardDescription.module.css';

function CardDescription({ description, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description || '');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setValue(description || '');
  }, [description]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
    setShowPreview(false);
  };

  const handleCancel = () => {
    setValue(description || '');
    setIsEditing(false);
    setShowPreview(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 4h11M2.5 7h11M2.5 10h7" stroke="currentColor"
            strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <h4 className={styles.title}>Description</h4>
        {!isEditing && description && (
          <button
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editor}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${!showPreview ? styles.tabActive : ''}`}
              onClick={() => setShowPreview(false)}
              type="button"
            >
              Write
            </button>
            <button
              className={`${styles.tab} ${showPreview ? styles.tabActive : ''}`}
              onClick={() => setShowPreview(true)}
              type="button"
            >
              Preview
            </button>
          </div>
          {showPreview ? (
            <div className={styles.preview}>
              {value || 'Nothing to preview'}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a more detailed description..."
              maxLength={5000}
            />
          )}
          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={handleSave} type="button">
              Save
            </button>
            <button className={styles.cancelBtn} onClick={handleCancel} type="button">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={styles.display}
          onClick={() => setIsEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
        >
          {description || 'Add a more detailed description...'}
        </div>
      )}
    </div>
  );
}

export default CardDescription;
