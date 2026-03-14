import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiChevronLeft,
    FiImage,
    FiTrendingUp,
    FiTool,
    FiUser
} from 'react-icons/fi';
import { FaTractor } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import vendorProductService from '../../services/vendorProductService';
import { publicCatalogService } from '../../../../services/catalogService';
import { vendorTheme as themeColors } from '../../../../theme';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import maintenanceService from '../../services/maintenanceService';
import { isWithinInterval, parseISO } from 'date-fns';

const MyStore = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
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
        unit: 'per day',
        stock: 1,
        imageUrl: '',
        images: [],
        specifications: [],
        hasDriver: false,
        driverDetails: { name: '', phone: '', photo: '', licenseNumber: '' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, maintRes] = await Promise.all([
                vendorProductService.getMyStore(),
                publicCatalogService.getCategories(),
                maintenanceService.getSchedules()
            ]);
            if (prodRes.success) setProducts(prodRes.data || []);
            if (catRes.success) setCategories(catRes.categories || catRes.data || []);
            setMaintenanceSchedules(maintRes.data || []);
        } catch (err) {
            toast.error("Data load karne mein dikkat hui");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploading(true);
            const token = sessionStorage.getItem('vendorAccessToken') || localStorage.getItem('vendorAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

            const uploadedUrls = [];
            for (const file of files) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const res = await fetch(`${baseUrl}/upload`, { 
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });
                const data = await res.json();
                if (data.success) {
                    uploadedUrls.push(data.imageUrl);
                }
            }

            if (uploadedUrls.length > 0) {
                setFormData(prev => {
                    const newImages = [...(prev.images || []), ...uploadedUrls];
                    return {
                        ...prev,
                        imageUrl: newImages[0] || prev.imageUrl,
                        images: newImages
                    };
                });
                toast.success(`${uploadedUrls.length} image(s) upload ho gayi!`);
            }
        } catch (err) {
            toast.error("Image upload fail ho gayi");
        } finally {
            setUploading(false);
        }
    };

    const handleDriverPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const token = sessionStorage.getItem('vendorAccessToken') || localStorage.getItem('vendorAccessToken');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const res = await fetch(`${baseUrl}/upload`, {
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
                toast.success("Driver photo upload ho gayi!");
            }
        } catch (err) {
            toast.error("Photo upload fail ho gayi");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validations
        if (!formData.title || !formData.price || !formData.categoryId) {
            return toast.error("Kripya Title, Price aur Category bharein");
        }

        // Driver Validations
        if (formData.hasDriver) {
            if (!formData.driverDetails.name) return toast.error("Driver ka naam zaroori hai");
            if (!formData.driverDetails.phone) return toast.error("Driver ka phone number zaroori hai");
            if (formData.driverDetails.phone.length !== 10) return toast.error("Phone number 10 digits ka hona chahiye");
        }

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
        if (!window.confirm("Kaya aap is machine ko sach me delete karna chahte hain?")) return;
        try {
            const res = await vendorProductService.delete(id);
            if (res.success) {
                setProducts(products.filter(p => p._id !== id));
                toast.success("Machine aapke fleet se hata di gayi");
            }
        } catch (err) {
            toast.error("Delete fail ho gaya");
        }
    };

    const openEdit = (product) => {
        setFormData({
            ...product,
            images: product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []),
            specifications: product.specifications || [],
            categoryId: product.categoryId?._id || product.categoryId,
            hasDriver: product.hasDriver || false,
            driverDetails: product.driverDetails || { name: '', phone: '', photo: '', licenseNumber: '' }
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
                    <h1 className="text-xl font-black text-slate-800 leading-tight">My Agri-Store</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipments & Farm Supplies</p>
                </div>
            </div>

            <div className="p-6 space-y-6 pb-24">
                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                            <FaTractor className="text-teal-600 text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Items</p>
                        <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                            <FiTrendingUp className="text-amber-600 text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inventory Value</p>
                        <p className="text-2xl font-black text-slate-800">₹{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Add Item Button */}
                <button
                    onClick={() => {
                        setEditMode(false);
                        setFormData({ 
                            title: '', categoryId: '', brandName: '', description: '', price: '', discountPrice: '', unit: 'per day', stock: 1, 
                            imageUrl: '', images: [], specifications: [],
                            hasDriver: false,
                            driverDetails: { name: '', phone: '', photo: '', licenseNumber: '' }
                        });
                        setShowModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-[32px] font-black text-white shadow-xl shadow-green-900/20 active:scale-95 transition-all outline-none"
                    style={{ backgroundColor: themeColors.button || '#2E7D32' }}
                >
                    <FiPlus className="w-6 h-6" /> Add Product/Equipment
                </button>

                {/* Products List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">My Shop Inventory</h2>
                        <FiSearch className="text-slate-400" />
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-400">Loading your machines...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                            <FaTractor className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="font-black text-slate-800 text-lg">No Items Added Yet</p>
                            <p className="text-sm text-slate-400 font-medium">Add your tractors, seeds, fertilizers, or tools to start selling and renting!</p>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product._id} className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 shadow-inner">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaTractor className="text-slate-300 text-2xl" />
                                        </div>
                                    )}
                                    
                                    {/* Maintenance Overlay */}
                                    {maintenanceSchedules.some(m => 
                                        String(m.equipmentId?._id || m.equipmentId) === String(product._id) &&
                                        isWithinInterval(new Date(), {
                                            start: parseISO(m.startDate),
                                            end: parseISO(m.endDate)
                                        })
                                    ) && (
                                        <div className="absolute inset-0 bg-rose-500/60 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-white uppercase tracking-tighter -rotate-12 bg-rose-600 px-1 py-0.5 rounded shadow-sm">Maintenance</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base leading-tight truncate">{product.title}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{product.brandName || Array.isArray(categories) && categories.find(c => (c.id || c._id) === (product.categoryId?._id || product.categoryId))?.title || 'Machine'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="font-black text-teal-600 text-base">₹{product.price}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                                                product.approvalStatus === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                                product.approvalStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {product.approvalStatus === 'pending_approval' ? 'Review Me Hai' : 
                                                 product.approvalStatus === 'approved' ? 'Live' : 'Rejected'}
                                            </span>
                                        </div>
                                    </div>
                                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                        <p className="text-[9px] text-rose-500 font-bold mt-1 bg-rose-50 p-2 rounded-xl border border-rose-100">
                                            Reason: {product.rejectionReason}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                Qty: {product.stock} | {product.unit}
                                            </span>
                                            {product.specifications?.slice(0, 2).map((spec, i) => (
                                                <span key={i} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                    {spec.name}: {spec.value}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(product)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-800 hover:bg-slate-200 transition-colors">
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 hover:bg-rose-100 transition-colors">
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
                    <div className="fixed inset-0 z-50 flex items-end justify-center pt-10">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white w-full max-h-[92vh] rounded-t-[48px] shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">{editMode ? 'Edit Item' : 'Add New Item'}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Equipment ki details bharein</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 pb-24">
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Photos (You can upload multiple)</label>
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                        {(formData.images || []).map((img, idx) => (
                                            <div key={idx} className="relative w-32 h-32 flex-shrink-0 rounded-[32px] bg-slate-50 border border-slate-200 overflow-hidden group snap-start">
                                                <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = formData.images.filter((_, i) => i !== idx);
                                                        setFormData({...formData, images: newImages, imageUrl: newImages[0] || ''});
                                                    }}
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-rose-500 shadow-sm flex items-center justify-center opacity-0 xl:opacity-100 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="w-32 h-32 flex-shrink-0 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 relative overflow-hidden group snap-start">
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <FiImage className="w-8 h-8 text-slate-300" />
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Add Photos</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                multiple
                                            />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product/Machine Name</label>
                                        <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" placeholder="e.g. Urea Fertilizer, Mahindra Tractor" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                            <select required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {categories && categories.length > 0 ? categories.map(cat => <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.title}</option>) : null}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand/Make</label>
                                            <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" placeholder="e.g. IFFCO, Mahindra, Bayer" value={formData.brandName} onChange={e => setFormData({ ...formData, brandName: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / Rent (₹)</label>
                                            <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                                            <select required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                                <option value="per kg">Per KG (Fertilizers/Seeds)</option>
                                                <option value="per packet">Per Packet</option>
                                                <option value="per hour">Per Hour (Machinery)</option>
                                                <option value="per day">Per Day</option>
                                                <option value="per acre">Per Acre</option>
                                                <option value="per order">Per Order</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity (Items/Machines)</label>
                                        <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Details</label>
                                        <textarea rows="3" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-medium outline-none" placeholder="Is product/machine ke baare mein likhein (e.g., 40HP tractor, or 100% organic fertilizer...)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>

                                    {/* Agri-Specifications (Dynamic) */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Technical Specs (Agri-Specs)</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData({...formData, specifications: [...(formData.specifications || []), {name: '', value: ''}]})}
                                                className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                            >
                                                + Add Tech Spec
                                            </button>
                                        </div>
                                        
                                        {formData.specifications && formData.specifications.length > 0 ? (
                                            <div className="space-y-2">
                                                {formData.specifications.map((spec, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Spec (HP, Weight)" 
                                                            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold outline-none"
                                                            value={spec.name}
                                                            onChange={e => {
                                                                const newSpecs = [...formData.specifications];
                                                                newSpecs[idx].name = e.target.value;
                                                                setFormData({...formData, specifications: newSpecs});
                                                            }}
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Value" 
                                                            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold outline-none"
                                                            value={spec.value}
                                                            onChange={e => {
                                                                const newSpecs = [...formData.specifications];
                                                                newSpecs[idx].value = e.target.value;
                                                                setFormData({...formData, specifications: newSpecs});
                                                            }}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setFormData({...formData, specifications: formData.specifications.filter((_, i) => i !== idx)})}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                        >
                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-4 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Specs Added</p>
                                                <p className="text-[8px] text-slate-400 font-medium">Add HP, Weight, etc. for better ranking</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Driver Logic */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.hasDriver ? 'bg-orange-500' : 'bg-slate-200'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${formData.hasDriver ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={formData.hasDriver}
                                                onChange={e => setFormData({...formData, hasDriver: e.target.checked})}
                                            />
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Include Driver with this Service?</span>
                                        </label>

                                        {formData.hasDriver && (
                                            <div className="mt-4 p-5 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-orange-200 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                                                        {formData.driverDetails.photo ? (
                                                            <img src={formData.driverDetails.photo} alt="driver" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FiUser className="text-orange-300 w-6 h-6" />
                                                        )}
                                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleDriverPhotoUpload} accept="image/*" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Driver's Identity</p>
                                                        <p className="text-[10px] text-orange-600 font-bold leading-tight">Add photo & details for trust</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Driver Name</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold outline-none" 
                                                            placeholder="e.g. Ram Singh"
                                                            value={formData.driverDetails.name}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                                setFormData({...formData, driverDetails: {...formData.driverDetails, name: val}});
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Phone Number</label>
                                                        <input 
                                                            type="tel" 
                                                            className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold outline-none" 
                                                            placeholder="10-digit number"
                                                            value={formData.driverDetails.phone}
                                                            maxLength={10}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                if(val.length <= 10) {
                                                                    setFormData({...formData, driverDetails: {...formData.driverDetails, phone: val}});
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">DL Number (Driving License)</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold outline-none" 
                                                        placeholder="e.g. MP09 2023 00..."
                                                        value={formData.driverDetails.licenseNumber}
                                                        maxLength={16}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                                            setFormData({...formData, driverDetails: {...formData.driverDetails, licenseNumber: val}});
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-5 rounded-[32px] font-black text-white shadow-xl shadow-green-900/20 active:scale-95 transition-all text-lg"
                                    style={{ backgroundColor: themeColors.button || '#2E7D32' }}
                                >
                                    {editMode ? 'Update Item Details' : 'Add to My Store'}
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
