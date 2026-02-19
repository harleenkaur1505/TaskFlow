import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import styles from './Boards.module.css';

function Boards() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user?.name}</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </div>
      <p className={styles.placeholder}>
        Your boards will appear here.
      </p>
    </div>
  );
}

export default Boards;
