import styles from './Navbar.module.css';
import {Search } from 'lucide-react';
import {Link} from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
      <div className={styles.logo}>
       <Link to="/">
       <img src="/store-logo.png" alt="Meta game shop" />
       </Link>
      </div>
       <Link to="/">
       <div className={styles.logoName}>META-GAME-SHOP</div>
       </Link>
      <div className={styles.search}>
        <input type="text" placeholder='Search games'/>
        <Search className={styles.searchIcon} />
      </div>
    </nav>
  );
};

export default Navbar;
