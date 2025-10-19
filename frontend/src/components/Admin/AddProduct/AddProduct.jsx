import React, { useState, useEffect } from 'react';
import './AddProduct.css';

const AddProduct = ({ onAddProduct, onEditProduct, editingProduct, onCancelEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'subscription',
    name: '',
    price: '',
    description: '',
    image: null
  });

  const categories = [
    { value: 'subscription', label: '👑 Subscription' },
    { value: 'special-offers', label: '⭐ Special Offers' },
    { value: 'game-topup', label: '🎮 Game Shop' }
  ];

  // If editing product, populate form
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        category: editingProduct.category,
        name: editingProduct.name,
        price: editingProduct.price.toString(),
        description: editingProduct.description,
        image: editingProduct.image
      });
      setShowModal(true);
    }
  }, [editingProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description) {
      alert('Please fill all fields');
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
      description: formData.description,
      image: formData.image || '/default-product.jpg'
    };

    if (editingProduct) {
      // Edit existing product
      onEditProduct(editingProduct.id, productData);
    } else {
      // Add new product
      onAddProduct(productData);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      category: 'subscription',
      name: '',
      price: '',
      description: '',
      image: null
    });
    onCancelEdit();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h1>
        <p>{editingProduct ? 'Update product information' : 'Create new products for your gaming store'}</p>
      </div>

      <div className="add-product-content">
        <div className="action-card">
          <h3>{editingProduct ? 'Editing Product' : 'Ready to add a new product?'}</h3>
          <p>{editingProduct ? 'You are currently editing a product' : 'Click the button below to open the product creation form'}</p>
          <button 
            onClick={() => setShowModal(true)}
            className="open-modal-btn"
          >
            {editingProduct ? '🔄 Update Product' : '🎮 Create New Product'}
          </button>
        </div>
      </div>

      {/* Modal/Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button 
                onClick={handleCloseModal}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              {/* Category Selection */}
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="form-input"
                  required
                />
              </div>

              {/* Price */}
              <div className="form-group">
                <label>Price (BDT)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="form-input"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              {/* Image Upload */}
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

              {/* Form Actions */}
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingProduct ? '✅ Update Product' : '✅ Add Product'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="cancel-btn"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;