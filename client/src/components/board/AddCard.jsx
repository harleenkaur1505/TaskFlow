import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useBoard from '../../hooks/useBoard';
import styles from './AddCard.module.css';

function AddCard({ listId }) {
  const { boardId } = useParams();
  const { addCard } = useBoard();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (isAdding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (isAdding) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdding]);

  const handleClose = () => {
    setIsAdding(false);
    setTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await addCard(boardId, listId, trimmed);
      setTitle('');
      textareaRef.current?.focus();
    } catch {
      // Error handled by API layer
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isAdding) {
    return (
      <button
        className={styles.trigger}
        onClick={() => setIsAdding(true)}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" />
        </svg>
        Add a card
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Enter a title for this card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        maxLength={200}
      />
      <div className={styles.actions}>
        <button className={styles.addButton} type="submit">
          Add card
        </button>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
          aria-label="Cancel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}

export default AddCard;
