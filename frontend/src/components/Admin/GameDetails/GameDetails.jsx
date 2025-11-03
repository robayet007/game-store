import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import { productAPI } from '../../../services/api';
import './GameDetails.css';

// ✅ Base URL constant - Vercel proxy use korbe
const BASE_URL = ""; // Empty string for relative paths

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts('game-topup');
  const [game, setGame] = useState(null);
  const [gameProducts, setGameProducts] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    // Find the main game by ID
    const foundGame = products.find(p => p._id === id);
    if (foundGame) {
      setGame(foundGame);
    }
    
    // Load game packages from API
    const loadGamePackages = async () => {
      try {
        const response = await productAPI.getGamePackages(id);
        if (response.data.success) {
          setGameProducts(response.data.packages);
        }
      } catch (error) {
        console.error('Error loading game packages:', error);
        setGameProducts([]);
      }
    };
    
    loadGamePackages();
  }, [id, products]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/400x300/667eea/ffffff?text=Game+Image';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return imgPath;  // ✅ Vercel proxy use korbe
    return 'https://via.placeholder.com/400x300/667eea/ffffff?text=Game+Image';
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product package? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await productAPI.deleteProduct(productId);
      
      if (response.data.success) {
        // Remove the deleted product from state
        setGameProducts(prevProducts => 
          prevProducts.filter(product => product._id !== productId)
        );
        alert('Product package deleted successfully!');
      } else {
        alert('Failed to delete product package: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product package: ' + (error.response?.data?.message || error.message || 'Network error'));
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title,
      price: product.price,
      description: product.description || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await productAPI.updateProduct(editingProduct._id, editForm);
      
      if (response.data.success) {
        // Update the product in state
        setGameProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === editingProduct._id 
              ? { ...product, ...editForm }
              : product
          )
        );
        setEditingProduct(null);
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + (error.response?.data?.message || error.message || 'Network error'));
    }
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditForm({ title: '', price: '', description: '' });
  };

  if (loading) {
    return (
      <div className="game-details-container">
        <div className="loading">Loading game details...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-details-container">
        <div className="error-state">
          <h2>Game not found</h2>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-details-container">
      {/* Header */}
      <div className="game-header">
        <h1 className="game-title">{game.title || game.name}</h1>
      </div>

      {/* Game Info Section */}
      <div className="game-main">
        <div className="game-image-section">
          <img 
            src={getImageUrl(game.image || game.imageUrl)} 
            alt={game.title || game.name}
            className="game-main-image"
          />
        </div>

        <div className="game-info-section">
          <h2>About this Game</h2>
          <p className="game-description">
            {game.description || 'Popular mobile game with millions of players worldwide.'}
          </p>
          
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Category</span>
              <span className="stat-value">{game.category || "Game"}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Players</span>
              <span className="stat-value">100M+</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rating</span>
              <span className="stat-value">4.5/5</span>
            </div>
          </div>

          <div className="action-buttons">
            <Link 
              to={`/admin/dashboard/game/${id}/add-product`}
              className="add-product-btn"
            >
              ➕ Add Product Package
            </Link>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="buy-now-btn"
            >
              🎮 Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Available Product Packages */}
      <div className="products-section">
        <div className="section-header">
          <h2>Available Product Packages</h2>
          <span className="product-count">{gameProducts.length} packages</span>
        </div>

        {gameProducts.length > 0 ? (
          <div className="products-grid">
            {gameProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img 
                    src={getImageUrl(product.image || product.imageUrl)} 
                    alt={product.title}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-price">৳ {product.price}</p>
                  <p className="product-description">
                    {product.description || 'Game package'}
                  </p>
                </div>
                <div className="product-actions">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="edit-btn"
                    disabled={deleting}
                  >
                    Edit Package
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="delete-btn"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No product packages available for this game yet.</p>
            <Link 
              to={`/admin/dashboard/game/${id}/add-product`}
              className="add-first-product-btn"
            >
              Add Your First Package
            </Link>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Product Package</h3>
              <button onClick={handleCloseEdit} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Product Title:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (৳):</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;