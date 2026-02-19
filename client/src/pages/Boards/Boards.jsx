import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import BoardCard from '../../components/boards/BoardCard';
import CreateBoardModal from '../../components/boards/CreateBoardModal';
import { BoardsSkeleton } from '../../components/ui/Skeleton';
import {
  getBoards,
  createBoard,
  toggleStar as toggleStarApi,
} from '../../api/boardsApi';
import styles from './Boards.module.css';

function Boards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async () => {
    try {
      setError(null);
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load boards';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async ({ title, background }) => {
    try {
      const newBoard = await createBoard({ title, background });
      setBoards((prev) => [newBoard, ...prev]);
      toast.success('Board created');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create board');
    }
  };

  const handleToggleStar = async (boardId) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b._id !== boardId) return b;
        const isStarred = b.starred.includes(user._id);
        return {
          ...b,
          starred: isStarred
            ? b.starred.filter((id) => id !== user._id)
            : [...b.starred, user._id],
        };
      }),
    );

    try {
      await toggleStarApi(boardId);
    } catch {
      fetchBoards();
    }
  };

  const starredBoards = boards.filter((b) => b.starred.includes(user?._id));
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.welcomeHeader}>
            <div className={styles.welcomeText}>
              <div className={styles.greetingSkeleton} />
              <div className={styles.subSkeleton} />
            </div>
          </div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Your boards</span>
            </div>
            <BoardsSkeleton />
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Welcome header */}
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeText}>
            <h1 className={styles.greeting}>Welcome back, {firstName}</h1>
            <p className={styles.greetingSub}>
              {boards.length === 0
                ? 'Create your first board to get started'
                : `${boards.length} board${boards.length !== 1 ? 's' : ''} in your workspace`}
            </p>
          </div>
          <button
            className={styles.createBtn}
            onClick={() => setModalOpen(true)}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
            </svg>
            New Board
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {boards.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIllustration}>
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <rect x="10" y="20" width="30" height="40" rx="4" fill="currentColor" opacity="0.08" />
                <rect x="45" y="10" width="30" height="50" rx="4" fill="currentColor" opacity="0.15" />
                <rect x="80" y="25" width="30" height="35" rx="4" fill="currentColor" opacity="0.08" />
                <rect x="18" y="28" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.15" />
                <rect x="18" y="34" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.1" />
                <rect x="53" y="18" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
                <rect x="53" y="24" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.15" />
                <rect x="53" y="30" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.1" />
                <rect x="88" y="33" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.15" />
                <rect x="88" y="39" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.1" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>Organize your work</h2>
            <p className={styles.emptyText}>
              Boards help you break work into lists and cards.
              Create one to start managing your tasks.
            </p>
            <button
              className={styles.emptyBtn}
              onClick={() => setModalOpen(true)}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" />
              </svg>
              Create your first board
            </button>
          </div>
        ) : (
          <>
            {starredBoards.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <svg className={styles.sectionIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5l1.854 3.956L14 6.086l-3 3.073L11.708 14 8 12.028 4.292 14 5 9.159l-3-3.073 4.146-.63L8 1.5z"
                      fill="#F2D600" />
                  </svg>
                  <span className={styles.sectionTitle}>Starred</span>
                  <span className={styles.sectionCount}>{starredBoards.length}</span>
                </div>
                <div className={styles.grid}>
                  {starredBoards.map((board) => (
                    <BoardCard
                      key={board._id}
                      board={board}
                      isStarred
                      onToggleStar={handleToggleStar}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9.5" y="1.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1.5" y="9.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <span className={styles.sectionTitle}>All Boards</span>
                <span className={styles.sectionCount}>{boards.length}</span>
              </div>
              <div className={styles.grid}>
                {boards.map((board) => (
                  <BoardCard
                    key={board._id}
                    board={board}
                    isStarred={board.starred.includes(user?._id)}
                    onToggleStar={handleToggleStar}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <CreateBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

export default Boards;
