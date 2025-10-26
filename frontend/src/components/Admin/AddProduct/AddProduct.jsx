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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = [
    { value: 'subscription', label: '👑 Subscription' },
    { value: 'special-offers', label: '⭐ Special Offers' },
    { value: 'game-topup', label: '🎮 Game Shop' }
  ];

  // Check if current category is game shop
  const isGameShop = formData.category === 'game-topup';

  // If editing product, populate form
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        category: editingProduct.category,
        name: editingProduct.title || editingProduct.name,
        price: editingProduct.price?.toString() || '',
        description: editingProduct.description || '',
        image: editingProduct.image || editingProduct.imageUrl
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
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);

      // Create preview
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
    
    // Validation based on category
    if (!formData.name) {
      alert('Product title is required');
      return;
    }

    if (!isGameShop) {
      // For non-game shop categories, validate all fields
      if (!formData.price || !formData.description) {
        alert('Please fill all required fields');
        return;
      }

      if (isNaN(formData.price) || Number(formData.price) <= 0) {
        alert('Please enter a valid price');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('title', formData.name);
      submitData.append('category', formData.category);
      
      // For game shop, set default values
      if (isGameShop) {
        submitData.append('price', '0'); // Default price for game shop
        submitData.append('description', 'Game shop item'); // Default description
      } else {
        submitData.append('price', formData.price);
        submitData.append('description', formData.description);
      }
      
      // Append image file if selected
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      console.log('📤 Submitting product data...');
      console.log('Form data:', {
        title: formData.name,
        category: formData.category,
        price: isGameShop ? '0' : formData.price,
        description: isGameShop ? 'Game shop item' : formData.description,
        hasImage: !!selectedFile
      });

      if (editingProduct) {
        // Edit existing product
        const productId = editingProduct._id || editingProduct.id;
        await onEditProduct(productId, submitData);
      } else {
        // Add new product
        await onAddProduct(submitData);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Error submitting product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'subscription',
      name: '',
      price: '',
      description: '',
      image: null
    });
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.querySelector('.file-input');
    if (fileInput) fileInput.value = '';
    
    onCancelEdit && onCancelEdit();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.querySelector('.file-input');
    if (fileInput) fileInput.value = '';
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
          <p>{editingProduct ? `You are editing: ${editingProduct.title || editingProduct.name}` : 'Click the button below to open the product creation form'}</p>
          <button 
            onClick={() => setShowModal(true)}
            className="open-modal-btn"
            disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              {/* Category Selection */}
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={isSubmitting}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {isGameShop && (
                  <small className="category-note">
                    🎮 Game Shop: Only title and image are required
                  </small>
                )}
              </div>

              {/* Product Name */}
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="form-input"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Price - Hide for game shop */}
              {!isGameShop && (
                <div className="form-group">
                  <label>Price (BDT) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="form-input"
                    min="0"
                    step="1"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}

              {/* Description - Hide for game shop */}
              {!isGameShop && (
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    className="form-textarea"
                    rows="4"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="form-group">
                <label>Product Image {isGameShop && '*'}</label>
                {!formData.image ? (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      disabled={isSubmitting}
                      required={isGameShop}
                    />
                    <div className="upload-placeholder">
                      <span className="upload-icon">📁</span>
                      <p>Click to upload product image</p>
                      <small>PNG, JPG, WEBP (Max 5MB)</small>
                    </div>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="remove-image-btn"
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="image-preview-text">Image preview - {selectedFile?.name}</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Processing...' : (editingProduct ? '✅ Update Product' : '✅ Add Product')}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="cancel-btn"
                  disabled={isSubmitting}
                >
                  ❌ Cancel
                </button>
              </div>

              {/* Required fields note */}
              <div className="form-note">
                <small>* Required fields</small>
                {isGameShop && (
                  <small className="game-shop-note">
                    🎮 For Game Shop: Only title and image are required. Price and description will be set automatically.
                  </small>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;