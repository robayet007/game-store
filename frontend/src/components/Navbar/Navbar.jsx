import styles from './Navbar.module.css';
import {Search } from 'lucide-react';

const Navbar = () => {
  return (
    <nav>
      <div className={styles.logo}>
        <img src="/store-logo.png" alt="Meta game shop" />
      </div>
      <div className={styles.search}>
        <input type="text" placeholder='Search games'/>
        <Search className={styles.searchIcon} />
      </div>
    </nav>
  );
};

export default Navbar;
