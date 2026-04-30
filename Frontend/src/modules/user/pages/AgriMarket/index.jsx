import React, { useState, useEffect } from 'react';
import { 
    FiSearch, 
    FiFilter, 
    FiChevronLeft,
    FiPackage,
    FiArrowRight
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ecommerceService from '../../../../services/ecommerceService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AgriMarket = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hasOrders, setHasOrders] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        let hasError = false;

        // Load products independently
        try {
            const prodRes = await ecommerceService.getProducts();
            if (prodRes.success) setProducts(prodRes.data || []);
        } catch (err) {
            console.error('Products fetch error:', err?.response?.data || err.message);
            hasError = true;
        }

        // Load categories independently (filter strictly for products)
        try {
            const catRes = await publicCatalogService.getCategories({ type: 'product' });
            if (catRes.success) {
                const allCats = catRes.categories || catRes.data || [];
                // STRICT FILTER: Only show categories meant for Seeds & Fertilizers marketplace
                // This hides any machinery or accidental test categories (like Tractor, Rotavator)
                const allowedKeywords = ['seed', 'fertilizer', 'pesticide', 'chemical', 'urea', 'zinc', 'spray', 'nutrition', 'crop'];
                const filteredCats = allCats.filter(cat => {
                    const title = cat.title?.toLowerCase() || '';
                    return allowedKeywords.some(kw => title.includes(kw));
                });
                setCategories(filteredCats);
                if (filteredCats.length > 0) {
                    setSelectedCategory(filteredCats[0]._id);
                }
            }
        } catch (err) {
            console.error('Categories fetch error:', err.message);
        }

        if (hasError) {
            toast.error("Products load karne mein dikkat hui");
        }

        // Check for existing orders
        try {
            const orderRes = await ecommerceService.getMyOrders();
            if (orderRes.success && orderRes.data?.length > 0) {
                setHasOrders(true);
            }
        } catch (err) {
            console.error('Orders check error:', err.message);
        }
        
        setLoading(false);
    };

    const filteredProducts = products.filter(p => {
        const trimmedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(trimmedSearch);
        const matchesCategory = selectedCategory === 'all' || p.categoryId?._id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Premium Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[48px] shadow-sm border-b border-slate-100 sticky top-0 z-40">
                <div className="flex items-center gap-4 mb-6 relative z-50">
                    <button onClick={() => navigate('/user')} className="p-3 bg-slate-50 rounded-2xl relative z-50 cursor-pointer pointer-events-auto active:scale-95 transition-all">
                        <FiChevronLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 leading-tight">Agri Marketplace</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Seeds & Fertilizers</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 bg-slate-50 rounded-2xl px-5 py-2 flex items-center gap-3 border border-slate-300">
                        <FiSearch className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search seeds, urea, zinc..." 
                            className="bg-transparent border-none outline-none font-bold text-sm w-full placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8 pb-32">
                {/* Categories Scroll */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Categories</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {categories.map((cat, idx) => (
                            <div 
                                key={cat._id || `cat-${idx}`}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`flex-shrink-0 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer snap-start border ${
                                    selectedCategory === cat._id ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20' : 'bg-white text-slate-400 border-slate-100'
                                }`}
                            >
                                {cat.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {loading ? (
                        [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-slate-200 rounded-[32px] animate-pulse" />)
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-2 py-20 text-center">
                            <FiPackage className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">No products found</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                key={product._id || `prod-${idx}`} 
                                onClick={() => navigate(`/user/agri-marketplace/${product._id}`)}
                                className="bg-white rounded-[20px] p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-1.5 group active:scale-[0.98] transition-all relative"
                            >
                                {/* Image Container - Smaller aspect */}
                                <div className="aspect-[1/1] rounded-[16px] bg-slate-50 overflow-hidden relative border border-slate-50">
                                    {product.imageUrl ? (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <FiPackage className="w-8 h-8 stroke-[1]" />
                                        </div>
                                    )}
                                    
                                    {/* Small Verified Badge */}
                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-md rounded-md border border-white/50">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-1 bg-teal-500 rounded-full" />
                                            <p className="text-[7px] font-black text-teal-700 uppercase tracking-tighter">Verified</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content - Reduced gaps */}
                                <div className="px-1 pb-1 flex flex-col">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                        {product.brandName || 'Agri Best'}
                                    </p>
                                    
                                    <h3 className="font-bold text-slate-800 text-[12px] leading-tight line-clamp-1 mb-1">
                                        {product.title}
                                    </h3>
                                    
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-sm font-black text-slate-900">₹{product.calculatorPrice?.totalPrice || product.price}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">/ {product.unit}</span>
                                        </div>

                                        {/* Compact Stock Indicator */}
                                        <div className="flex items-center justify-between mt-0.5">
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                                                product.stock > 10 
                                                    ? 'bg-emerald-50 text-emerald-600' 
                                                    : product.stock > 0 
                                                        ? 'bg-amber-50 text-amber-600' 
                                                        : 'bg-red-50 text-red-600'
                                            }`}>
                                                <div className={`w-0.5 h-0.5 rounded-full ${
                                                    product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                                <span className="text-[7px] font-black uppercase tracking-tight">
                                                    {product.stock > 0 ? 'In Stock' : 'Out'}
                                                </span>
                                            </div>
                                            
                                            {product.stock > 0 && (
                                                <p className="text-[8px] font-bold text-slate-300">
                                                    {product.stock} left
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Float Action - My Orders (Only if user has orders) */}
            {hasOrders && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        onClick={() => navigate('/user/my-agri-orders')}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-full shadow-2xl shadow-slate-900/40 active:scale-95 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">Track My Orders</span>
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <FiArrowRight className="w-3 h-3" />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgriMarket;
