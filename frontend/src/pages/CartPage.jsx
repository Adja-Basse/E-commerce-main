import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2 className="empty-cart-title">Votre panier est vide</h2>
                        <p className="empty-cart-text">
                            Découvrez notre collection et ajoutez des produits à votre panier
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Découvrir nos produits
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">Panier</h1>

                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <Link to={`/product/${item.id}`} className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </Link>

                                <div className="cart-item-details">
                                    <Link to={`/product/${item.id}`} className="cart-item-name">
                                        {item.name}
                                    </Link>
                                    <p className="cart-item-category">{item.category}</p>
                                    <p className="cart-item-price">{item.price}€</p>
                                </div>

                                <div className="cart-item-actions">
                                    <div className="quantity-selector">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="quantity-btn"
                                            aria-label="Diminuer la quantité"
                                        >
                                            −
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="quantity-btn"
                                            aria-label="Augmenter la quantité"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="cart-item-total">
                                        {(item.price * item.quantity).toFixed(2)}€
                                    </p>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="remove-btn"
                                        aria-label="Retirer du panier"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2 className="summary-title">Résumé</h2>

                        <div className="summary-row">
                            <span>Sous-total</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>

                        <div className="summary-row">
                            <span>Livraison</span>
                            <span className="free-shipping">Gratuite</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span className="total-price">{cartTotal.toFixed(2)}€</span>
                        </div>

                        <button className="btn btn-primary checkout-btn">
                            Passer la commande
                        </button>

                        <button onClick={clearCart} className="btn btn-secondary">
                            Vider le panier
                        </button>

                        <Link to="/products" className="continue-shopping">
                            ← Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
