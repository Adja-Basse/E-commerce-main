import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }
        alert('Inscription réussie!');
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass">
                    <div className="auth-header">
                        <h1 className="auth-title">Inscription</h1>
                        <p className="auth-subtitle">Créez votre compte pour commencer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Nom complet</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="input"
                                placeholder="Jean Dupont"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="8"
                            />
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" required />
                            <span>
                                J'accepte les{' '}
                                <Link to="/terms" className="auth-link">
                                    conditions d'utilisation
                                </Link>
                            </span>
                        </label>

                        <button type="submit" className="btn btn-primary auth-btn">
                            S'inscrire
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>ou</span>
                    </div>

                    <div className="social-auth">
                        <button className="social-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuer avec Google
                        </button>
                    </div>

                    <p className="auth-footer">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="auth-link">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
