import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';
import './ProductsPage.css';

const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Filter by category
        if (selectedCategory !== 'Tous') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered = [...filtered].sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered = [...filtered].sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [selectedCategory, searchQuery, sortBy]);

    return (
        <div className="products-page">
            <div className="products-header">
                <div className="container">
                    <h1 className="page-title">Notre Collection</h1>
                    <p className="page-subtitle">
                        Découvrez notre sélection complète de produits premium
                    </p>
                </div>
            </div>

            <div className="products-content container">
                <aside className="filters-sidebar">
                    <div className="filter-section">
                        <h3 className="filter-title">Rechercher</h3>
                        <input
                            type="search"
                            placeholder="Rechercher un produit..."
                            className="input search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Catégories</h3>
                        <div className="category-filters">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Trier par</h3>
                        <select
                            className="input sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="featured">Recommandés</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="name">Nom A-Z</option>
                        </select>
                    </div>
                </aside>

                <main className="products-main">
                    <div className="products-toolbar">
                        <p className="products-count">
                            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="products-grid grid grid-3">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            <div className="no-products-icon">🔍</div>
                            <h3 className="no-products-title">Aucun produit trouvé</h3>
                            <p className="no-products-text">
                                Essayez de modifier vos filtres ou votre recherche
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setSelectedCategory('Tous');
                                    setSearchQuery('');
                                }}
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;
