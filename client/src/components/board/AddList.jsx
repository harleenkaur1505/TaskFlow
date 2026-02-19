import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useBoard from '../../hooks/useBoard';
import styles from './AddList.module.css';

function AddList() {
  const { boardId } = useParams();
  const { addList } = useBoard();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
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
      await addList(boardId, trimmed);
      setTitle('');
      inputRef.current?.focus();
    } catch {
      // Error handled by API layer
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
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
        Add another list
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        className={styles.input}
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={100}
      />
      <div className={styles.actions}>
        <button className={styles.addButton} type="submit">
          Add list
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

export default AddList;
