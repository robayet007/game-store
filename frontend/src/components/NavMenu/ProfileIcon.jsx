import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { User } from "lucide-react";
import "./NavMenu.css";

export default function ProfileIcon() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 When icon clicked
  const handleClick = () => {
    if (loading) return; // prevent redirect while checking state

    if (user) {
      navigate("/profile/dashboard"); // ✅ logged in
    } else {
      navigate("/profile/login"); // ❌ not logged in
    }
  };

  return (
    <div onClick={handleClick} className="navmenu-item">
      <div className="navmenu-icon">
        <User size={24} />
      </div>
      <span className="navmenu-text">Profile</span>
    </div>
  );
}
