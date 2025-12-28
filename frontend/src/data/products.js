// Mock product data
export const products = [
    {
        id: 1,
        name: 'Casque Audio Premium',
        category: 'Audio',
        price: 299,
        oldPrice: 399,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        badge: 'Nouveau',
        reviews: 128,
        description: 'Casque audio sans fil haut de gamme avec réduction de bruit active et son Hi-Fi exceptionnel.',
        features: ['Bluetooth 5.0', 'Autonomie 30h', 'Réduction de bruit', 'Pliable'],
        inStock: true
    },
    {
        id: 2,
        name: 'Montre Connectée Elite',
        category: 'Montres',
        price: 449,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        badge: 'Populaire',
        reviews: 256,
        description: 'Montre connectée élégante avec suivi santé complet et design raffiné.',
        features: ['GPS intégré', 'Étanche 50m', 'ECG', 'Autonomie 7 jours'],
        inStock: true
    },
    {
        id: 3,
        name: 'Appareil Photo Mirrorless',
        category: 'Photo',
        price: 1299,
        oldPrice: 1499,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
        reviews: 89,
        description: 'Appareil photo professionnel avec capteur plein format et vidéo 4K.',
        features: ['24MP', 'Vidéo 4K 60fps', 'Stabilisation 5 axes', 'WiFi/Bluetooth'],
        inStock: true
    },
    {
        id: 4,
        name: 'Sac à Dos Design',
        category: 'Accessoires',
        price: 129,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        reviews: 342,
        description: 'Sac à dos urbain premium avec compartiment laptop et design minimaliste.',
        features: ['Laptop 15"', 'USB charging', 'Imperméable', 'Anti-vol'],
        inStock: true
    },
    {
        id: 5,
        name: 'Lunettes de Soleil Luxe',
        category: 'Accessoires',
        price: 189,
        oldPrice: 249,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
        badge: 'Promo',
        reviews: 167,
        description: 'Lunettes de soleil polarisées avec monture premium et protection UV400.',
        features: ['Polarisées', 'UV400', 'Monture titane', 'Étui inclus'],
        inStock: true
    },
    {
        id: 6,
        name: 'Sneakers Premium',
        category: 'Chaussures',
        price: 159,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        reviews: 423,
        description: 'Baskets lifestyle premium avec design moderne et confort optimal.',
        features: ['Cuir premium', 'Semelle ergonomique', 'Respirant', 'Unisexe'],
        inStock: true
    },
    {
        id: 7,
        name: 'Parfum Signature',
        category: 'Parfums',
        price: 89,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop',
        badge: 'Exclusif',
        reviews: 234,
        description: 'Eau de parfum exclusive aux notes boisées et épicées.',
        features: ['100ml', 'Longue tenue', 'Notes boisées', 'Coffret luxe'],
        inStock: true
    },
    {
        id: 8,
        name: 'Enceinte Bluetooth Design',
        category: 'Audio',
        price: 199,
        oldPrice: 249,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
        reviews: 178,
        description: 'Enceinte portable haut de gamme avec son 360° et design élégant.',
        features: ['Son 360°', 'Autonomie 24h', 'Étanche IPX7', 'Bluetooth 5.0'],
        inStock: true
    },
    {
        id: 9,
        name: 'Portefeuille Cuir',
        category: 'Accessoires',
        price: 79,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
        reviews: 289,
        description: 'Portefeuille en cuir véritable avec protection RFID.',
        features: ['Cuir véritable', 'RFID', 'Compact', 'Garantie 5 ans'],
        inStock: true
    },
    {
        id: 10,
        name: 'Clavier Mécanique RGB',
        category: 'Tech',
        price: 149,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
        badge: 'Gaming',
        reviews: 512,
        description: 'Clavier mécanique gaming avec switches premium et RGB personnalisable.',
        features: ['Switches Cherry MX', 'RGB', 'USB-C', 'Repose-poignet'],
        inStock: true
    },
    {
        id: 11,
        name: 'Bouteille Isotherme',
        category: 'Lifestyle',
        price: 39,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
        reviews: 645,
        description: 'Bouteille isotherme en acier inoxydable, garde le froid 24h et le chaud 12h.',
        features: ['500ml', 'Inox', '24h froid', 'Sans BPA'],
        inStock: true
    },
    {
        id: 12,
        name: 'Lampe LED Intelligente',
        category: 'Maison',
        price: 69,
        oldPrice: 89,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop',
        reviews: 198,
        description: 'Lampe connectée avec 16 millions de couleurs et contrôle vocal.',
        features: ['WiFi', 'Alexa/Google', '16M couleurs', 'Programmable'],
        inStock: true
    }
];

export const categories = [
    'Tous',
    'Audio',
    'Montres',
    'Photo',
    'Accessoires',
    'Chaussures',
    'Parfums',
    'Tech',
    'Lifestyle',
    'Maison'
];
