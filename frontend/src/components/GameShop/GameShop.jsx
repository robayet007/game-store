"use client"

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import "./GameShop.css";

// ✅ Base URL constant
const BASE_URL = "http://13.236.52.33:5000";

const categories = ["All", "Battle Royale", "FPS", "MOBA", "Sports", "Strategy", "RPG"];

function GameShop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Use your hook to fetch game shop products
  const { products, loading, error } = useProducts('game-topup');

  const filteredGames = products.filter(game => {
    const matchesCategory = selectedCategory === "All" || (game.category && game.category === selectedCategory);
    const matchesSearch = (game.title || game.name).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ✅ Image URL handler function
  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop';
    
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    if (imgPath.startsWith('/uploads/')) {
      return `${BASE_URL}${imgPath}`;  // ✅ BASE_URL use করা হয়েছে
    }
    
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop';
  };

  // ✅ UPDATE: Handle card click - navigate to game details page
  const handleCardClick = (game) => {
    navigate(`/game/${game._id || game.id}`, {
      state: {
        game: game
      }
    });
  };

  // Handle "Top Up Now" button click - navigate to checkout
  const handleTopUpClick = (game, e) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/checkout/${game._id || game.id}`, {
      state: {
        product: {
          id: game._id || game.id,
          title: game.title || game.name,
          image: getImageUrl(game.image || game.imageUrl),
          category: game.category || "Game",
          price: game.price || 0,
          description: game.description || "Game top-up service"
        }
      }
    });
  };

  // Handle "Details" button click - navigate to game details page
  const handleDetailsClick = (game, e) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/game/${game._id || game.id}`, {
      state: {
        game: game
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="gameshop-wrapper">
        <div className="gameshop-container">
          <div className="gameshop-header">
            <h1 className="gameshop-title">Game Shop</h1>
            <p className="gameshop-subtitle">Discover and play amazing mobile games</p>
          </div>
          <div className="loading">
            <p>Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="gameshop-wrapper">
        <div className="gameshop-container">
          <div className="gameshop-header">
            <h1 className="gameshop-title">Game Shop</h1>
            <p className="gameshop-subtitle">Discover and play amazing mobile games</p>
          </div>
          <div className="error">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gameshop-wrapper">
      <div className="gameshop-container">
        {/* Header */}
        <div className="gameshop-header">
          <h1 className="gameshop-title">Game Shop</h1>
          <p className="gameshop-subtitle">Discover and play amazing mobile games</p>
        </div>

        {/* Search and Filter Section */}
        <div className="gameshop-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="games-grid">
          {filteredGames.map(game => (
            <div 
              key={game._id || game.id} 
              className="game-card"
              onClick={() => handleCardClick(game)}
            >
              <div className="game-image-container">
                <img 
                  src={getImageUrl(game.image || game.imageUrl)} 
                  alt={game.title || game.name}
                  className="game-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop';
                  }}
                />
                <div className="game-overlay">
                  <span className="game-category">{game.category || "Game"}</span>
                  <span className="game-price">available</span>
                </div>
              </div>

              <div className="game-info">
                <h3 className="game-name">{game.title || game.name}</h3>
                
                <div className="game-stats">
                  <div className="game-rating">
                    <span className="rating-stars">★★★★★</span>
                    <span className="rating-value">4.5</span>
                  </div>
                  <span className="game-players">100M+</span>
                </div>

                <div className="game-actions">
                  <button 
                    className="play-now-btn"
                    onClick={(e) => handleTopUpClick(game, e)}
                  >
                    Top Up Now
                  </button>
                  <button 
                    className="details-btn"
                    onClick={(e) => handleDetailsClick(game, e)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredGames.length === 0 && products.length > 0 && (
          <div className="no-results">
            <h3>No games found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && (
          <div className="no-results">
            <h3>No games available</h3>
            <p>Check back later for new game additions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameShop;