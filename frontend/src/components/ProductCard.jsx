import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product);
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image-wrapper">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                    />
                    {product.badge && (
                        <span className="product-badge">{product.badge}</span>
                    )}
                </div>

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>

                    <div className="product-footer">
                        <div className="product-price">
                            {product.oldPrice && (
                                <span className="product-old-price">{product.oldPrice}€</span>
                            )}
                            <span className="product-current-price">{product.price}€</span>
                        </div>

                        <div className="product-rating">
                            <span className="rating-stars">★★★★★</span>
                            <span className="rating-count">({product.reviews || 0})</span>
                        </div>
                    </div>
                </div>
            </Link>

            <button
                onClick={handleAddToCart}
                className="add-to-cart-btn"
                aria-label={`Ajouter ${product.name} au panier`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Ajouter
            </button>
        </div>
    );
};

export default ProductCard;
