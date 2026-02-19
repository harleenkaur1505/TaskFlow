import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCards } from '../../api/searchApi';
import styles from './SearchModal.module.css';

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTotal(0);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  const handleSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchCards(term);
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  // Flatten results for keyboard navigation
  const flatCards = results.flatMap((group) =>
    group.cards.map((card) => ({
      ...card,
      boardId: group.board._id,
      boardTitle: group.board.title,
    })),
  );

  const handleNavigate = (boardId, cardId) => {
    onClose();
    navigate(`/board/${boardId}/card/${cardId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, flatCards.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }

    if (e.key === 'Enter' && activeIndex >= 0 && flatCards[activeIndex]) {
      e.preventDefault();
      const card = flatCards[activeIndex];
      handleNavigate(card.boardId, card._id);
    }
  };

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Search cards"
      >
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search cards..."
            value={query}
            onChange={handleInputChange}
            aria-label="Search cards"
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setQuery('');
                setResults([]);
                setTotal(0);
                inputRef.current?.focus();
              }}
              type="button"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" />
              </svg>
            </button>
          )}
          <span className={styles.escBadge}>ESC</span>
        </div>

        <div className={styles.results}>
          {isLoading && (
            <div className={styles.skeletons}>
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className={styles.empty}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" />
              </svg>
              <span>No cards found</span>
            </div>
          )}

          {!isLoading && results.map((group) => (
            <div key={group.board._id} className={styles.group}>
              <div className={styles.groupHeader}>{group.board.title}</div>
              {group.cards.map((card) => {
                flatIndex++;
                const currentIndex = flatIndex;
                return (
                  <button
                    key={card._id}
                    className={`${styles.resultItem} ${currentIndex === activeIndex ? styles.resultItemActive : ''}`}
                    onClick={() => handleNavigate(group.board._id, card._id)}
                    type="button"
                    onMouseEnter={() => setActiveIndex(currentIndex)}
                  >
                    {card.labels && card.labels.length > 0 && (
                      <span
                        className={styles.labelDot}
                        style={{ background: card.labels[0].color }}
                      />
                    )}
                    <span className={styles.cardTitle}>{card.title}</span>
                    {card.list && (
                      <span className={styles.listBadge}>{card.list.title}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {query && !isLoading && total > 0 && (
          <div className={styles.footer}>
            <span className={styles.hint}>
              <kbd className={styles.key}>↵</kbd> Open
            </span>
            <span className={styles.hint}>
              <kbd className={styles.key}>↑↓</kbd> Navigate
            </span>
            <span className={styles.hint}>
              <kbd className={styles.key}>Esc</kbd> Close
            </span>
            <span className={styles.totalCount}>{total} result{total !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
