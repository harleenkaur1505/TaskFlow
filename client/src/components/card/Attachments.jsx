import { useRef } from 'react';
import { format } from 'date-fns';
import styles from './Attachments.module.css';

function Attachments({ attachments, onUpload, onDelete }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  const items = attachments || [];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8.5 4L4.5 8a2.83 2.83 0 004 4l5.33-5.33a1.89 1.89 0 00-2.66-2.67L5.83 9.33a.94.94 0 001.34 1.34L10.5 7.33"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <h4 className={styles.title}>Attachments</h4>
      </div>

      {items.length > 0 && (
        <div className={styles.list}>
          {items.map((att) => (
            <div key={att._id} className={styles.item}>
              <div className={styles.fileIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="1.5" width="10" height="13" rx="1.5"
                    stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3"
                    stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.fileInfo}>
                <a
                  className={styles.fileName}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {att.filename}
                </a>
                <span className={styles.fileDate}>
                  Added {att.uploadedAt ? format(new Date(att.uploadedAt), 'MMM d, yyyy') : ''}
                </span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(att._id)}
                type="button"
                aria-label={`Delete ${att.filename}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
                    strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx"
      />
      <button
        className={styles.addBtn}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        Add an attachment
      </button>
    </div>
  );
}

export default Attachments;
