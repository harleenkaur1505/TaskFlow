import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import styles from './Board.module.css';

function Board() {
  const { boardId } = useParams();

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <p className={styles.placeholder}>
          Board view coming soon. Board ID: {boardId}
        </p>
      </div>
    </>
  );
}

export default Board;
