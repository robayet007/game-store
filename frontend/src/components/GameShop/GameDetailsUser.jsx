import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../../services/api';
import './GameDetailsUser.css';

const GameDetailsUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [gamePackages, setGamePackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameDetails = async () => {
      try {
        setLoading(true);
        
        // If game data passed from navigation, use it
        if (location.state?.game) {
          setGame(location.state.game);
        }
        
        // Load game packages from API
        const response = await productAPI.getGamePackages(id);
        if (response.data.success) {
          setGamePackages(response.data.packages);
        }
      } catch (error) {
        console.error('Error loading game details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGameDetails();
  }, [id, location.state]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/400x300/667eea/ffffff?text=Game+Image';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return `https://noncompoundable-unconstruable-karyn.ngrok-free.dev/${imgPath}`;  // ✅ Changed here
    return 'https://via.placeholder.com/400x300/667eea/ffffff?text=Game+Image';
  };

  const handlePackageSelect = (pkg) => {
    navigate(`/checkout/${pkg._id}`, {
      state: {
        product: {
          id: pkg._id,
          title: pkg.title,
          image: getImageUrl(pkg.image || pkg.imageUrl),
          category: 'game-topup',
          price: pkg.price,
          description: pkg.description,
          gameName: game?.title || game?.name
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="game-details-user-container">
        <div className="loading">Loading game details...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-details-user-container">
        <div className="error-state">
          <h2>Game not found</h2>
          <button onClick={() => navigate('/games')} className="back-btn">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-details-user-container">
      {/* Header */}
      <div className="game-header-user">
        <button onClick={() => navigate('/games')} className="back-button">
          ← Back to Games
        </button>
        <h1 className="game-title-user">{game.title || game.name}</h1>
      </div>

      {/* Game Info Section */}
      <div className="game-main-user">
        <div className="game-image-section-user">
          <img 
            src={getImageUrl(game.image || game.imageUrl)} 
            alt={game.title || game.name}
            className="game-main-image-user"
          />
        </div>

        <div className="game-info-section-user">
          <h2>About this Game</h2>
          <p className="game-description-user">
            {game.description || 'Popular mobile game with millions of players worldwide.'}
          </p>
          
          <div className="game-stats-user">
            <div className="stat-user">
              <span className="stat-label-user">Category</span>
              <span className="stat-value-user">{game.category || "Game"}</span>
            </div>
            <div className="stat-user">
              <span className="stat-label-user">Players</span>
              <span className="stat-value-user">100M+</span>
            </div>
            <div className="stat-user">
              <span className="stat-label-user">Rating</span>
              <span className="stat-value-user">4.5/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Packages Section */}
      <div className="packages-section-user">
        <div className="section-header-user">
          <h2>Available Packages</h2>
          <span className="package-count">{gamePackages.length} packages available</span>
        </div>

        {gamePackages.length > 0 ? (
          <div className="packages-grid-user">
            {gamePackages.map(pkg => (
              <div key={pkg._id} className="package-card-user">
                <div className="package-image-user">
                  <img 
                    src={getImageUrl(pkg.image || pkg.imageUrl)} 
                    alt={pkg.title}
                  />
                </div>
                <div className="package-info-user">
                  <h3>{pkg.title}</h3>
                  <p className="package-price-user">৳ {pkg.price}</p>
                  <p className="package-description-user">
                    {pkg.description || 'Game package with great value'}
                  </p>
                </div>
                <div className="package-actions-user">
                  <button 
                    onClick={() => handlePackageSelect(pkg)}
                    className="purchase-btn-user"
                  >
                    Purchase Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-packages-user">
            <p>No packages available for this game at the moment.</p>
            <p>Please check back later or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetailsUser;