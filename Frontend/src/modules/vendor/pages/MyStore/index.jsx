import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiPackage,
    FiSearch,
    FiChevronLeft,
    FiImage,
    FiTrendingUp,
    FiBox
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import vendorProductService from '../../services/vendorProductService';
import { publicCatalogService } from '../../../../services/catalogService';
import { vendorTheme as themeColors } from '../../../../theme';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MyStore = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        brandName: '',
        description: '',
        price: '',
        discountPrice: '',
        unit: 'kg',
        stock: 0,
        imageUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                vendorProductService.getMyStore(),
                publicCatalogService.getCategories()
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
        } catch (err) {
            toast.error("Data load karne mein dikkat hui");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            setUploading(true);
            const token = sessionStorage.getItem('vendorAccessToken') || localStorage.getItem('vendorAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

            // Use common admin/upload or vendor specific one if exists. 
            // Based on server.js, /api/admin/upload is there, but vendors might not have permissions.
            // Let's check server.js again for generic upload.
            const res = await fetch(`${baseUrl}/admin/upload`, { // Using admin upload for now as it's generic in logic
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
                toast.success("Image upload ho gayi!");
            }
        } catch (err) {
            toast.error("Image upload fail ho gayi");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editMode) {
                res = await vendorProductService.update(formData._id, formData);
            } else {
                res = await vendorProductService.add(formData);
            }

            if (res.success) {
                toast.success(res.message);
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            toast.error("Action fail ho gaya");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete kar dein?")) return;
        try {
            const res = await vendorProductService.delete(id);
            if (res.success) {
                setProducts(products.filter(p => p._id !== id));
                toast.success("Product hata diya gaya");
            }
        } catch (err) {
            toast.error("Delete nahi ho gaya");
        }
    };

    const openEdit = (product) => {
        setFormData({
            ...product,
            categoryId: product.categoryId?._id || product.categoryId
        });
        setEditMode(true);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Custom Navbar (Mobile Style) */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 flex items-center px-4 py-4 gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-xl">
                    <FiChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-slate-800 leading-tight">Mera Store</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketplace Inventory</p>
                </div>
            </div>

            <div className="p-6 space-y-6 pb-24">
                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                            <FiBox className="text-teal-600" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Items</p>
                        <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                            <FiTrendingUp className="text-amber-600" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock Value</p>
                        <p className="text-2xl font-black text-slate-800">₹{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Add Item Button */}
                <button
                    onClick={() => {
                        setEditMode(false);
                        setFormData({ title: '', categoryId: '', brandName: '', description: '', price: '', discountPrice: '', unit: 'kg', stock: 0, imageUrl: '' });
                        setShowModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-[32px] font-black text-white shadow-xl shadow-teal-50/20 active:scale-95 transition-all"
                    style={{ backgroundColor: themeColors.primary }}
                >
                    <FiPlus className="w-6 h-6" /> Naya Samaan Jodein
                </button>

                {/* Products List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Mere Products</h2>
                        <FiSearch className="text-slate-400" />
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-400">Inventory load ho rahi hai...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                            <FiPackage className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="font-black text-slate-800 text-lg">Abhi shop khali hai</p>
                            <p className="text-sm text-slate-400 font-medium">Samaan jodein aur bechna shuru karein!</p>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product._id} className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiPackage className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base leading-tight truncate">{product.title}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{product.brandName}</p>
                                        </div>
                                        <p className="font-black text-teal-600 text-base">₹{product.price}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                Stock: {product.stock} {product.unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(product)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-800">
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white w-full max-h-[95vh] rounded-t-[48px] shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">{editMode ? 'Edit Product' : 'Add Product'}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Samaan ki details bharein</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 pb-12">
                                {/* Image Upload */}
                                <div className="space-y-2 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 relative overflow-hidden group">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <FiImage className="w-8 h-8 text-slate-300" />
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Upload Photo</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                        <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" placeholder="e.g. Urea Khad" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                            <select required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                                <option value="">Select</option>
                                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                            <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" placeholder="e.g. IFFCO" value={formData.brandName} onChange={e => setFormData({ ...formData, brandName: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                            <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                                            <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea rows="3" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-medium outline-none" placeholder="Product details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-5 rounded-[32px] font-black text-white shadow-xl shadow-teal-50/20 active:scale-95 transition-all text-lg"
                                    style={{ backgroundColor: themeColors.primary }}
                                >
                                    {editMode ? 'Update Product' : 'Add to My Store'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyStore;
