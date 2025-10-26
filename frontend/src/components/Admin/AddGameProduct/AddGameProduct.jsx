// components/AddGameProduct/AddGameProduct.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import './AddGameProduct.css';

const AddGameProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, loading } = useProducts('game-topup');
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    image: null
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Find the game by ID
    const foundGame = products.find(p => p._id === id || p.id === id);
    if (foundGame) {
      setGame(foundGame);
      // Auto-fill title with game name
      setFormData(prev => ({
        ...prev,
        title: `${foundGame.title} - Product`
      }));
    }
  }, [id, products]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('category', 'game-topup');
    submitData.append('price', formData.price);
    submitData.append('description', formData.description || `Product for ${game?.title}`);
    submitData.append('gameId', id); // Link to the parent game
    
    if (selectedFile) {
      submitData.append('image', selectedFile);
    }

    const result = await addProduct(submitData);
    
    if (result.success) {
      alert('Product added successfully!');
      navigate(`/admin/dashboard/game/${id}`);
    } else {
      alert('Error: ' + result.error);
    }
  };

  if (!game) {
    return <div className="loading">Loading game information...</div>;
  }

  return (
    <div className="add-game-product-container">
      <div className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Admin Dashboard
        </button>
        <h1>Add Product for {game.title}</h1>
        <p>Create new product offerings for this game</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Diamond Package, Premium Pass, etc."
              required
            />
          </div>

          <div className="form-group">
            <label>Price (BDT) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe this product package..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/dashboard')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGameProduct;