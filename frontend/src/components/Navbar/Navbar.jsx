import styles from './Navbar.module.css';
import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/store-logo.png" alt="Meta game shop" />
        </Link>
      </div>
      <Link to="/">
        <div className={styles.logoName}>META-GAME-STORE</div>
      </Link>
    </nav>
  );
};

export default Navbar;
