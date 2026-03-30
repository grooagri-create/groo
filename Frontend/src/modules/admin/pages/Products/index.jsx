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
    FiUploadCloud,
    FiUser
} from 'react-icons/fi';
import adminProductService from '../../../../services/adminProductService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('marketplace');

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        brandName: '',
        description: '',
        price: '',
        discountPrice: '',
        unit: 'hour',
        stock: 1,
        imageUrl: '',
        images: [],
        type: 'machinery',
        hasDriver: false,
        driverDetails: {
            name: '',
            phone: '',
            photo: '',
            licenseNumber: ''
        },
        specifications: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, pendingRes, catRes] = await Promise.all([
                adminProductService.getAll(),
                adminProductService.getVendorSubmissions('pending', 'machinery'),
                publicCatalogService.getCategories()
            ]);
            // getAllProducts now returns both admin + approved vendor products
            if (prodRes.success) setProducts((prodRes.data || []).filter(p => p.type === 'machinery'));
            // Pending: Only pending vendor submissions for machinery
            if (pendingRes.success) setPendingProducts(pendingRes.data);
            if (catRes.success) setCategories(catRes.categories || catRes.data || []);
        } catch (err) {
            toast.error("Machinery data load karne mein dikkat hui");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const token = sessionStorage.getItem('adminAccessToken') || localStorage.getItem('adminAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const res = await fetch(`${baseUrl}/admin/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadFormData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ 
                    ...prev, 
                    imageUrl: data.imageUrl,
                    images: [...(prev.images || []), data.imageUrl]
                }));
                toast.success("Image upload ho gayi!");
            }
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDriverPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const token = sessionStorage.getItem('adminAccessToken') || localStorage.getItem('adminAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const res = await fetch(`${baseUrl}/admin/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadFormData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ 
                    ...prev, 
                    driverDetails: { ...prev.driverDetails, photo: data.imageUrl }
                }));
                toast.success("Driver photo uploaded!");
            }
        } catch (err) {
            toast.error("Driver photo upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this machinery/equipment?")) return;
        try {
            const res = await adminProductService.approveProduct(id, { commissionPercentage: 0, gstPercentage: 18 });
            if (res.success) {
                toast.success("Machinery Approved!");
                fetchData();
                setShowModal(false);
            }
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return;
        try {
            const res = await adminProductService.rejectProduct(id, reason);
            if (res.success) {
                toast.success("Rejected");
                fetchData();
            }
        } catch (err) {
            toast.error("Rejection failed");
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
                toast.success("Saved successfully");
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            toast.error("Save failed");
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
            unit: 'hour',
            stock: 1,
            imageUrl: '',
            images: [],
            type: 'machinery',
            hasDriver: false,
            driverDetails: { name: '', phone: '', photo: '', licenseNumber: '' },
            specifications: []
        });
        setEditMode(false);
    };

    const openEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            ...product,
            categoryId: product.categoryId?._id || product.categoryId,
            type: 'machinery',
            hasDriver: product.hasDriver || false,
            driverDetails: product.driverDetails || { name: '', phone: '', photo: '', licenseNumber: '' }
        });
        setEditMode(true);
        setShowModal(true);
    };

    const currentList = activeTab === 'marketplace' ? products : pendingProducts;
    const filteredProducts = currentList.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Machinery Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage Equipment & Heavy Machinery Approvals</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                >
                    + Add Machinery
                </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button onClick={() => setActiveTab('marketplace')} className={`pb-4 px-2 font-black text-sm uppercase tracking-wider relative ${activeTab === 'marketplace' ? 'text-slate-800' : 'text-slate-400'}`}>
                    Live Fleet ({products.length})
                    {activeTab === 'marketplace' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 rounded-t-full" />}
                </button>
                <button onClick={() => setActiveTab('pending')} className={`pb-4 px-2 font-black text-sm uppercase tracking-wider relative ${activeTab === 'pending' ? 'text-orange-600' : 'text-slate-400'}`}>
                    New Approvals ({pendingProducts.length})
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full" />}
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner / Shop</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">Loading...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">No machinery found</td></tr>
                        ) : filteredProducts.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden">
                                            {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">{p.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.brandName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                                        {p.categoryId?.title || 'Machine'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {p.vendorId ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <FiUser className="w-3 h-3 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-700 text-xs leading-tight">{p.vendorId?.businessName || p.vendorId?.name || 'Vendor'}</p>
                                                <p className="text-[9px] text-orange-600 font-bold uppercase">Owner</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Admin</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-black text-slate-800 text-sm">₹{p.price}/{p.unit}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        {activeTab === 'pending' ? (
                                            <>
                                                <button onClick={() => openEdit(p)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs">Review</button>
                                                <button onClick={() => handleApprove(p._id)} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs">Approve</button>
                                                <button onClick={() => handleReject(p._id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs">Reject</button>
                                            </>
                                        ) : (
                                            <>
                                                {!p.vendorId && (
                                                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-slate-800 transition-all"><FiEdit2 /></button>
                                                )}
                                                <button onClick={() => adminProductService.delete(p._id).then(fetchData)} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><FiTrash2 /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800">{editMode ? 'Edit Machinery' : 'New Machinery'}</h2>
                                <button onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Title</label>
                                        <input className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                                        <select className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Price</label>
                                        <input type="number" className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Unit (hour/day)</label>
                                        <input className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Brand</label>
                                        <input className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} />
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.hasDriver ? 'bg-orange-500' : 'bg-slate-200'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transform ${formData.hasDriver ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <input type="checkbox" className="hidden" checked={formData.hasDriver} onChange={e => setFormData({...formData, hasDriver: e.target.checked})} />
                                        <span className="text-xs font-black uppercase tracking-tight">Include Driver Details?</span>
                                    </label>
                                    
                                    {formData.hasDriver && (
                                        <div className="mt-4 p-5 bg-orange-50/30 rounded-3xl border border-orange-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input placeholder="Driver Name" className="bg-white rounded-xl p-3 text-sm font-bold outline-none" value={formData.driverDetails.name} onChange={e => setFormData({...formData, driverDetails: {...formData.driverDetails, name: e.target.value}})} />
                                                <input placeholder="Phone" className="bg-white rounded-xl p-3 text-sm font-bold outline-none" value={formData.driverDetails.phone} onChange={e => setFormData({...formData, driverDetails: {...formData.driverDetails, phone: e.target.value}})} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                            <div className="p-8 bg-slate-50 border-t flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white border rounded-2xl font-black text-xs uppercase">Cancel</button>
                                <button onClick={handleSubmit} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Save Machinery</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageProducts;
