import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
    const { cartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-container container">
                <Link to="/" className="logo">
                    <span className="logo-icon">✨</span>
                    <span className="logo-text">Shop</span>
                </Link>

                <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                    <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Accueil
                    </Link>
                    <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Produits
                    </Link>
                    <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        À propos
                    </Link>
                    <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Contact
                    </Link>
                </nav>

                <div className="header-actions">
                    <button className="ai-assistant-btn" aria-label="Assistant IA">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span className="ai-assistant-text">Assistant IA</span>
                    </button>

                    <Link to="/login" className="header-icon" aria-label="Connexion">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>

                    <Link to="/cart" className="header-icon cart-icon" aria-label="Panier">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>

                    <button
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
