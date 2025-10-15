"use client"

import { useState } from "react";
import { Link } from 'react-router-dom';
import "./GameShop.css";

const gamesData = [
  {
    id: 1,
    name: "Free Fire",
    slug: "freefire",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
    category: "Battle Royale",
    price: "available",
    rating: 4.5,
    players: "500M+"
  },
  {
    id: 2,
    name: "PUBG Mobile",
    slug: "pubg",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    category: "Battle Royale",
    price: "available",
    rating: 4.8,
    players: "1B+"
  },
  {
    id: 3,
    name: "E-Football",
    slug: "efootball",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop",
    category: "Sports",
    price: "available",
    rating: 4.3,
    players: "300M+"
  },
  {
    id: 4,
    name: "Clash of Clans",
    slug: "clashofclans",
    image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&h=300&fit=crop",
    category: "Strategy",
    price: "available",
    rating: 4.7,
    players: "500M+"
  },
  {
    id: 5,
    name: "Call of Duty",
    slug: "callofduty",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    category: "FPS",
    price: "available",
    rating: 4.6,
    players: "500M+"
  },
  {
    id: 6,
    name: "Valorant",
    slug: "valorant",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop",
    category: "FPS",
    price: "available",
    rating: 4.4,
    players: "200M+"
  },
  {
    id: 7,
    name: "Mobile Legends",
    slug: "mobilelegends",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop",
    category: "MOBA",
    price: "available",
    rating: 4.2,
    players: "1B+"
  },
  {
    id: 8,
    name: "Genshin Impact",
    slug: "genshinimpact",
    image: "https://images.unsplash.com/photo-1635863138275-d9b33299680a?w=400&h=300&fit=crop",
    category: "RPG",
    price: "available",
    rating: 4.9,
    players: "400M+"
  },
  {
    id: 9,
    name: "Clash Royale",
    slug: "clashroyale",
    image: "https://images.unsplash.com/photo-1585504198191-3c1b143d0b8d?w=400&h=300&fit=crop",
    category: "Strategy",
    price: "available",
    rating: 4.5,
    players: "300M+"
  },
  {
    id: 10,
    name: "Fortnite",
    slug: "fortnite",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop",
    category: "Battle Royale",
    price: "available",
    rating: 4.7,
    players: "350M+"
  }
];

const categories = ["All", "Battle Royale", "FPS", "MOBA", "Sports", "Strategy", "RPG"];

function GameShop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = gamesData.filter(game => {
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <Link 
              key={game.id} 
              to={`/games/${game.slug}`} 
              className="game-card"
            >
              <div className="game-image-container">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="game-image"
                  loading="lazy"
                />
                <div className="game-overlay">
                  <span className="game-category">{game.category}</span>
                  <span className="game-price">{game.price}</span>
                </div>
              </div>

              <div className="game-info">
                <h3 className="game-name">{game.name}</h3>
                
                <div className="game-stats">
                  <div className="game-rating">
                    <span className="rating-stars">★★★★★</span>
                    <span className="rating-value">{game.rating}</span>
                  </div>
                  <span className="game-players">{game.players}</span>
                </div>

                <div className="game-actions">
                  <button className="play-now-btn">Top Up Now</button>
                  <button className="details-btn">Details</button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Message */}
        {filteredGames.length === 0 && (
          <div className="no-results">
            <h3>No games found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameShop;