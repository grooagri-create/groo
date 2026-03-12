import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiStar,
    FiSearch,
    FiPackage,
    FiFilter,
    FiMoreVertical,
    FiUploadCloud
} from 'react-icons/fi';
import adminProductService from '../../../../services/adminProductService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        brandName: '',
        description: '',
        price: '',
        discountPrice: '',
        unit: 'bag',
        stock: 0,
        imageUrl: '',
        isFeatured: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                adminProductService.getAll(),
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
            const token = sessionStorage.getItem('adminAccessToken') || localStorage.getItem('adminAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

            const res = await fetch(`${baseUrl}/admin/upload`, {
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
            } else {
                toast.error(data.message || "Upload fail ho gaya");
            }
        } catch (err) {
            toast.error("Image upload fail ho gayi");
        } finally {
            setUploading(false);
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            const res = await adminProductService.toggleFeatured(id);
            if (res.success) {
                setProducts(products.map(p =>
                    p._id === id ? { ...p, isFeatured: res.isFeatured } : p
                ));
                toast.success(res.message);
            }
        } catch (err) {
            toast.error("Status update nahi ho paya");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Kya aap waqai is product ko delete karna chahte hain?")) return;
        try {
            const res = await adminProductService.delete(id);
            if (res.success) {
                setProducts(products.filter(p => p._id !== id));
                toast.success("Product uda diya gaya");
            }
        } catch (err) {
            toast.error("Delete nahi ho paya");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editMode) {
                res = await adminProductService.update(currentProduct._id, formData);
            } else {
                res = await adminProductService.create(formData);
            }

            if (res.success) {
                toast.success(res.message);
                setShowModal(false);
                fetchData();
                resetForm();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Submit fail ho gaya");
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            categoryId: '',
            brandName: '',
            description: '',
            price: '',
            discountPrice: '',
            unit: 'bag',
            stock: 0,
            imageUrl: '',
            isFeatured: false
        });
        setEditMode(false);
        setCurrentProduct(null);
    };

    const openEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            title: product.title,
            categoryId: product.categoryId?._id || product.categoryId,
            brandName: product.brandName || '',
            description: product.description || '',
            price: product.price,
            discountPrice: product.discountPrice || '',
            unit: product.unit,
            stock: product.stock,
            imageUrl: product.imageUrl || '',
            isFeatured: product.isFeatured
        });
        setEditMode(true);
        setShowModal(true);
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Marketplace Products</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage Seeds, Fertilizers & Agri-inputs</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <FiPlus className="w-5 h-5" /> Add New Product
                </button>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Products</p>
                    <p className="text-2xl font-black text-slate-800">{products.length}</p>
                </div>
                <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Featured Items</p>
                    <p className="text-2xl font-black text-emerald-600">{products.filter(p => p.isFeatured).length}</p>
                </div>
                <div className="md:col-span-2 bg-white px-5 py-2 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-3">
                    <FiSearch className="text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or brand..."
                        className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock/Unit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Featured</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center font-bold text-slate-400">No products found</td>
                                </tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiPackage className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-tight">{product.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{product.brandName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                            {product.categoryId?.title || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-black text-emerald-600 text-sm">₹{product.discountPrice || product.price}</p>
                                            {product.discountPrice && (
                                                <p className="text-[10px] text-slate-300 line-through font-bold">₹{product.price}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-slate-700 text-sm">{product.stock}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{product.unit}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleFeatured(product._id)}
                                            className={`p-2 rounded-xl transition-all ${product.isFeatured
                                                    ? 'bg-amber-100 text-amber-600 shadow-sm shadow-amber-50'
                                                    : 'bg-slate-100 text-slate-300 hover:text-slate-400'
                                                }`}
                                        >
                                            <FiStar className={product.isFeatured ? 'fill-current' : ''} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Product Specifications</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                                {/* Image Upload & Basic Info Row */}
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-full md:w-1/3 aspect-square bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                                        {formData.imageUrl ? (
                                            <>
                                                <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black">Change Image</label>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <FiUploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Click to upload product image</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Hybrid Tomato Seeds"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                                value={formData.brandName}
                                                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                                placeholder="e.g. Syngenta"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="kg, bag, litre..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Original Price (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offer Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-emerald-600 outline-none"
                                            value={formData.discountPrice}
                                            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-bold text-slate-700 outline-none"
                                            value={formData.status || 'active'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 font-medium text-slate-700 outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add product details, benefits, etc."
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2 pb-4">
                                    <input
                                        type="checkbox"
                                        id="featured_check_modal"
                                        className="w-5 h-5 rounded border-none bg-slate-100 text-slate-900 focus:ring-0"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    />
                                    <label htmlFor="featured_check_modal" className="text-sm font-black text-slate-800">Feature this product on Home Page</label>
                                </div>

                                <div className="flex gap-4 sticky bottom-0 bg-white pb-2 pt-4 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-8 py-4 bg-slate-50 text-slate-500 font-black rounded-2xl transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {editMode ? 'Update Product' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageProducts;
