import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import './HomePage.css';

const HomePage = () => {
    const featuredProducts = products.slice(0, 6);
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        alert(`Merci de vous être abonné avec ${email}!`);
        setEmail('');
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Découvrez l'Excellence
                        </h1>
                        <p className="hero-subtitle">
                            Une sélection premium de produits d'exception pour un style de vie raffiné
                        </p>
                        <div className="hero-actions">
                            <a href="/products" className="btn btn-primary">
                                Explorer la Collection
                            </a>
                            <a href="/about" className="btn btn-outline">
                                En Savoir Plus
                            </a>
                        </div>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Produits Premium</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Clients Satisfaits</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Avis Positifs</div>
                        </div>
                    </div>
                </div>
                <div className="hero-gradient"></div>
            </section>

            {/* Features Section */}
            <section className="features container">
                <div className="feature-card">
                    <div className="feature-icon">🚚</div>
                    <h3 className="feature-title">Livraison Gratuite</h3>
                    <p className="feature-text">Sur toutes les commandes de plus de 50€</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3 className="feature-title">Paiement Sécurisé</h3>
                    <p className="feature-text">Transactions 100% sécurisées</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">↩️</div>
                    <h3 className="feature-title">Retours Faciles</h3>
                    <p className="feature-text">30 jours pour changer d'avis</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">⭐</div>
                    <h3 className="feature-title">Qualité Premium</h3>
                    <p className="feature-text">Produits soigneusement sélectionnés</p>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Produits Vedettes</h2>
                        <p className="section-subtitle">
                            Découvrez notre sélection des meilleurs produits du moment
                        </p>
                    </div>
                    <div className="products-grid grid grid-3">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="section-footer">
                        <a href="/products" className="btn btn-secondary">
                            Voir Tous les Produits
                        </a>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title">Explorez par Catégorie</h2>
                    <div className="categories-grid">
                        <a href="/products?category=Audio" className="category-card">
                            <div className="category-icon">🎧</div>
                            <h3 className="category-name">Audio</h3>
                        </a>
                        <a href="/products?category=Montres" className="category-card">
                            <div className="category-icon">⌚</div>
                            <h3 className="category-name">Montres</h3>
                        </a>
                        <a href="/products?category=Photo" className="category-card">
                            <div className="category-icon">📷</div>
                            <h3 className="category-name">Photo</h3>
                        </a>
                        <a href="/products?category=Accessoires" className="category-card">
                            <div className="category-icon">👜</div>
                            <h3 className="category-name">Accessoires</h3>
                        </a>
                        <a href="/products?category=Tech" className="category-card">
                            <div className="category-icon">💻</div>
                            <h3 className="category-name">Tech</h3>
                        </a>
                        <a href="/products?category=Lifestyle" className="category-card">
                            <div className="category-icon">✨</div>
                            <h3 className="category-name">Lifestyle</h3>
                        </a>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-card glass">
                        <h2 className="newsletter-title">Restez Informé</h2>
                        <p className="newsletter-text">
                            Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives et nouveautés
                        </p>
                        <form className="newsletter-form-home" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary">
                                S'abonner
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
