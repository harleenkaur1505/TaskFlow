import { useState, useEffect, useRef } from 'react';
import { getBoardGradient } from '../../utils/boardGradient';
import styles from './CreateBoardModal.module.css';

const COLORS = [
  '#0079BF', '#D29034', '#519839', '#B04632',
  '#89609E', '#CD5A91', '#00AECC', '#838C91',
];

function CreateBoardModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate({ title: title.trim(), background });
      setTitle('');
      setBackground(COLORS[0]);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
        <div className={styles.preview} style={{ background: getBoardGradient(background) }}>
          <div className={styles.previewLists}>
            <div className={styles.previewList} />
            <div className={styles.previewList} />
            <div className={styles.previewList} />
          </div>
          <span className={styles.previewTitle}>
            {title || 'Your board title'}
          </span>
        </div>

        <button className={styles.close} onClick={onClose} type="button"
          aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="boardTitle" className={styles.label}>
              Board title <span className={styles.required}>*</span>
            </label>
            <input
              ref={inputRef}
              id="boardTitle"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your board..."
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Background</label>
            <div className={styles.colorGrid}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorSwatch} ${
                    background === color ? styles.colorSelected : ''
                  }`}
                  style={{ background: getBoardGradient(color) }}
                  onClick={() => setBackground(color)}
                  aria-label={`Select color ${color}`}
                >
                  {background === color && (
                    <svg viewBox="0 0 16 16" fill="none"
                      className={styles.checkIcon}>
                      <path d="M3 8.5l3.5 3.5L13 4" stroke="white"
                        strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={styles.createBtn}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Board'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateBoardModal;
