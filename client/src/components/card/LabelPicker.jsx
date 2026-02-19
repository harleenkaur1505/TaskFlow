import { useState, useRef, useEffect } from 'react';
import styles from './LabelPicker.module.css';

const PRESET_COLORS = [
  '#EB5A46', '#F2D600', '#61BD4F', '#0079BF',
  '#C377E0', '#FF9F1A', '#00C2E0', '#51E898',
  '#FF78CB', '#344563',
];

function LabelPicker({ labels, onToggle, onClose }) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newText, setNewText] = useState('');
  const pickerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const currentLabels = labels || [];

  const isSelected = (color) => {
    return currentLabels.some((l) => l.color === color);
  };

  const handleToggle = (color, text) => {
    onToggle(color, text);
  };

  const handleCreateLabel = () => {
    if (newColor) {
      onToggle(newColor, newText.trim());
      setIsCreating(false);
      setNewText('');
    }
  };

  const filteredColors = PRESET_COLORS.filter((color) => {
    if (!search) return true;
    const label = currentLabels.find((l) => l.color === color);
    return label?.text?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={styles.picker} ref={pickerRef}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Labels</span>
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

      <div className={styles.searchBox}>
        <input
          ref={searchRef}
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labels..."
          type="text"
        />
      </div>

      {!isCreating ? (
        <>
          <div className={styles.labelsList}>
            <span className={styles.sectionLabel}>Labels</span>
            {filteredColors.map((color) => {
              const existingLabel = currentLabels.find((l) => l.color === color);
              const text = existingLabel?.text || '';
              const selected = isSelected(color);

              return (
                <div key={color} className={styles.labelRow}>
                  <button
                    className={`${styles.checkbox} ${selected ? styles.checked : ''}`}
                    onClick={() => handleToggle(color, text)}
                    type="button"
                    aria-label={`Toggle label ${text || color}`}
                  >
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white"
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <button
                    className={styles.colorChip}
                    style={{ backgroundColor: color }}
                    onClick={() => handleToggle(color, text)}
                    type="button"
                  >
                    {text && <span className={styles.chipText}>{text}</span>}
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.createSection}>
            <button
              className={styles.createBtn}
              onClick={() => setIsCreating(true)}
              type="button"
            >
              Create a new label
            </button>
          </div>
        </>
      ) : (
        <div className={styles.createForm}>
          <span className={styles.sectionLabel}>Name</span>
          <input
            className={styles.nameInput}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Label name (optional)"
            maxLength={30}
            type="text"
          />
          <span className={styles.sectionLabel}>Color</span>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.colorSwatch} ${newColor === color ? styles.colorSelected : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewColor(color)}
                type="button"
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className={styles.createActions}>
            <button
              className={styles.saveBtn}
              onClick={handleCreateLabel}
              type="button"
            >
              Create
            </button>
            <button
              className={styles.backBtn}
              onClick={() => setIsCreating(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabelPicker;
