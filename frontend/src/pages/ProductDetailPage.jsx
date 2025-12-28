import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Produit non trouvé</h2>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Retour aux produits
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        alert(`${quantity} ${product.name} ajouté(s) au panier!`);
    };

    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="product-detail-page">
            <div className="container">
                <nav className="breadcrumb">
                    <Link to="/">Accueil</Link>
                    <span>/</span>
                    <Link to="/products">Produits</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </nav>

                <div className="product-detail">
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={product.image} alt={product.name} />
                            {product.badge && <span className="product-badge">{product.badge}</span>}
                        </div>
                    </div>

                    <div className="product-details">
                        <div className="product-header">
                            <span className="product-category">{product.category}</span>
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-rating-detail">
                                <span className="rating-stars">★★★★★</span>
                                <span className="rating-text">({product.reviews || 0} avis)</span>
                            </div>
                        </div>

                        <div className="product-price-section">
                            {product.oldPrice && (
                                <span className="old-price">{product.oldPrice}€</span>
                            )}
                            <span className="current-price">{product.price}€</span>
                            {product.oldPrice && (
                                <span className="discount-badge">
                                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                                </span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {product.features && (
                            <div className="product-features">
                                <h3 className="features-title">Caractéristiques</h3>
                                <ul className="features-list">
                                    {product.features.map((feature, index) => (
                                        <li key={index}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="product-actions">
                            <div className="quantity-selector">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="quantity-btn"
                                    aria-label="Diminuer la quantité"
                                >
                                    −
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="quantity-btn"
                                    aria-label="Augmenter la quantité"
                                >
                                    +
                                </button>
                            </div>

                            <button onClick={handleAddToCart} className="btn btn-primary add-to-cart-large">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Ajouter au panier
                            </button>
                        </div>

                        <div className="product-info-cards">
                            <div className="info-card">
                                <span className="info-icon">🚚</span>
                                <div>
                                    <strong>Livraison gratuite</strong>
                                    <p>Dès 50€ d'achat</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <span className="info-icon">↩️</span>
                                <div>
                                    <strong>Retours gratuits</strong>
                                    <p>Sous 30 jours</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <span className="info-icon">✓</span>
                                <div>
                                    <strong>Garantie</strong>
                                    <p>2 ans constructeur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2 className="section-title">Produits Similaires</h2>
                        <div className="products-grid grid grid-4">
                            {relatedProducts.map(p => (
                                <Link to={`/product/${p.id}`} key={p.id} className="related-product-card">
                                    <img src={p.image} alt={p.name} />
                                    <h3>{p.name}</h3>
                                    <p className="price">{p.price}€</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
