import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiChevronLeft, FiPlus, FiTrash2, FiUpload, 
  FiSettings, FiCheckCircle, FiInfo, FiUser,
  FiZap, FiMapPin, FiClock, FiCalendar, FiSmartphone, FiCreditCard, FiChevronDown, FiActivity
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import vendorEquipmentService from '../../../../services/vendorEquipmentService';
import vendorService from '../../../../services/vendorService';
import { getWorkers } from '../../services/workerService';
import LogoLoader from '../../../../components/common/LogoLoader';

const AddEquipment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [machineTypes, setMachineTypes] = useState([]);
  const [machineImplements, setMachineImplements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [vendorWorkers, setVendorWorkers] = useState([]);
  const [showWorkerLink, setShowWorkerLink] = useState(false);

  const [form, setForm] = useState({
    categoryId: '',
    listingType: 'service',
    implements: [],          // NEW: [{subCategoryId, pricing:{hourly,land_based,daily}}]
    subCategoryIds: [],      // legacy fallback
    name: '',
    modelNumber: '',
    year: new Date().getFullYear(),
    description: '',
    images: [],
    pricing: {
      hourly:     { price: 0, isEnabled: true },
      land_based: { price: 0, isEnabled: false },
      daily:      { price: 0, isEnabled: false }
    },
    includesDriver: true,
    driver: {
      name: '',
      phone: '',
      photo: '',
      aadharNumber: '',
      licenseNumber: '',
      aadharImage: '',
      licenseImage: '',
      additionalCharge: 0
    },
    workerId: null
  });

  // Tracks the selected category's metadata (trackingType, requiresDriver)
  const [categoryMeta, setCategoryMeta] = useState({ trackingType: 'none', requiresDriver: false });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Get Vendor Profile for City-based filtering
      const profileRes = await vendorService.getProfile();
      const cityId = profileRes.data?.address?.cityId || profileRes.data?.cityId;

      const res = await vendorEquipmentService.getMachineTypes(cityId);
      if (res.success) setMachineTypes(res.data);

      const workerRes = await getWorkers();
      if (workerRes.success) setVendorWorkers(workerRes.data);

      if (isEdit) {
        const eqRes = await vendorEquipmentService.getMyEquipment();
        const item = eqRes.data?.find(e => e._id === id);
        if (item) {
          setForm({
            ...item,
            categoryId: item.categoryId?._id || item.categoryId,
            subCategoryIds: item.subCategoryIds?.map(s => s._id || s) || [],
            driver: item.driver || {
              name: '',
              phone: '',
              photo: '',
              aadharNumber: '',
              licenseNumber: '',
              aadharImage: '',
              licenseImage: '',
              additionalCharge: 0
            }
          });
          const implRes = await vendorEquipmentService.getImplements(item.categoryId?._id || item.categoryId);
          if (implRes.success) setMachineImplements(implRes.data);
        }
      }
    } catch (err) {
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setForm(prev => ({ ...prev, categoryId, implements: [], subCategoryIds: [] }));
    setMachineImplements([]);
    if (!categoryId) return;

    try {
      const res = await vendorEquipmentService.getImplements(categoryId);
      if (res.success) setMachineImplements(res.data);

      // Fetch category metadata to drive adaptive UI (trackingType, requiresDriver)
      const allTypes = machineTypes;
      const selected = allTypes.find(t => t.id === categoryId);
      if (selected) {
        const isService = selected.trackingType === 'odometer';
        setCategoryMeta({ trackingType: selected.trackingType || 'none', requiresDriver: selected.requiresDriver || false });
        setForm(prev => ({
          ...prev,
          listingType: isService ? 'service' : 'rental',
          includesDriver: selected.requiresDriver || false
        }));
      }
    } catch (err) {
      toast.error('Failed to load implements');
    }
  };

  const handleImageUpload = async (e, variant = 'general') => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        if (variant === 'driver') {
          setForm(prev => ({ ...prev, driver: { ...prev.driver, photo: data.imageUrl } }));
        } else {
          setForm(prev => ({ ...prev, images: [...prev.images, data.imageUrl] }));
        }
        toast.success('Upload success');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Basic Identity Validation
    if (!form.categoryId) return toast.error('Please select machine type');
    if (!form.name || form.name.length < 3) return toast.error('Please enter a valid machine name');
    
    // 2. Pricing Validation
    const enabledModes = Object.keys(form.pricing).filter(k => form.pricing[k].isEnabled);
    if (enabledModes.length === 0) return toast.error('Please enable at least one pricing mode (Hourly, Acre or Daily)');
    
    for (const mode of enabledModes) {
      if (form.pricing[mode].price <= 0) {
        return toast.error(`Please set a valid price for ${mode.replace('_', ' ')} mode`);
      }
    }

    // 3. Driver/Operator Validation - only for 'service' type (Tractor/Harvester)
    if (form.listingType === 'service' && form.includesDriver) {
      if (!form.driver.name) return toast.error('Operator name is required');
      if (!form.driver.phone || !/^[6-9]\d{9}$/.test(form.driver.phone)) {
        return toast.error('Valid 10-digit operator phone number is required');
      }
      if (!form.driver.aadharNumber || !/^\d{12}$/.test(form.driver.aadharNumber)) {
        return toast.error('Valid 12-digit Aadhar Card number is required');
      }
      const dlRegex = /^[A-Z]{2}[0-9A-Z]{13,14}$/;
      if (!form.driver.licenseNumber || !dlRegex.test(form.driver.licenseNumber.toUpperCase())) {
        return toast.error('Please enter a valid Driving License number (e.g. RJ1420230001234)');
      }
    }

    // 4. Visuals Validation
    if (form.images.length === 0) return toast.error('Please upload at least one machine photo');

    try {
      setSubmitting(true);
      if (isEdit) {
        await vendorEquipmentService.update(id, form);
        toast.success('Updated');
      } else {
        await vendorEquipmentService.add(form);
        toast.success('Listing created successfully!');
      }
      navigate('/vendor/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-[#F0F5F9] pb-32">
      {/* Simple Header */}
      <div className="px-6 py-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm">
          <FiChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Edit Asset' : 'New Machine'}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5"> Machinery Catalog </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        
        {/* Identity Card (Blue) */}
        <div className="bg-[#1D4ED8] rounded-[32px] p-6 shadow-xl shadow-blue-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Main Configuration</p>
              <h2 className="text-white text-xl font-black tracking-tight">{form.name || 'Untitled Machine'}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="absolute left-4 top-2 text-[9px] font-bold text-white/50 uppercase">Machine Category</label>
              <select 
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 pt-6 text-sm font-black text-white outline-none appearance-none"
                value={form.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="" className="text-slate-800">Select Type (Tractor etc)</option>
                {machineTypes.map(t => <option key={t.id} value={t.id} className="text-slate-800">{t.title}</option>)}
              </select>
              <FiChevronDown className="absolute right-5 bottom-4 text-white/50" />
            </div>

            <AnimatePresence>
              {machineImplements.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                   <p className="text-white/50 text-[9px] font-bold uppercase ml-1">Implements & Pricing</p>
                   <div className="space-y-2">
                    {machineImplements.map(impl => {
                      const selected = form.implements.find(i => i.subCategoryId === impl.id);
                      return (
                        <div key={impl.id} className={`rounded-2xl transition-all overflow-hidden ${selected ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10'}`}>
                          {/* Implement Header - Toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const exists = form.implements.find(i => i.subCategoryId === impl.id);
                              if (exists) {
                                setForm(p => ({ ...p, implements: p.implements.filter(i => i.subCategoryId !== impl.id) }));
                              } else {
                                setForm(p => ({
                                  ...p,
                                  implements: [...p.implements, {
                                    subCategoryId: impl.id,
                                    pricing: {
                                      hourly:     { price: 0, isEnabled: form.pricing.hourly.isEnabled },
                                      land_based: { price: 0, isEnabled: form.pricing.land_based.isEnabled },
                                      daily:      { price: 0, isEnabled: form.pricing.daily.isEnabled }
                                    }
                                  }]
                                }));
                              }
                            }}
                            className="w-full flex items-center justify-between px-4 py-3"
                          >
                            <span className={`text-[11px] font-black uppercase ${selected ? 'text-white' : 'text-white/50'}`}>{impl.title}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${selected ? 'bg-white/60' : 'bg-white/20'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${selected ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                          </button>
                          {/* Per-implement Pricing Inputs */}
                          {selected && (
                            <div className="px-4 pb-4 space-y-2">
                              {['hourly', 'land_based', 'daily'].map(key => {
                                if (!form.pricing[key].isEnabled) return null;
                                return (
                                  <div key={key} className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
                                    <p className="text-[10px] font-black text-white/70 uppercase w-16 flex-shrink-0">
                                      {key === 'land_based' ? 'Per Acre' : key === 'hourly' ? 'Hourly' : 'Daily'}
                                    </p>
                                    <span className="text-white font-black">₹</span>
                                    <input
                                      type="number"
                                      className="flex-1 bg-transparent text-white font-black text-sm outline-none placeholder:text-white/30"
                                      placeholder="0"
                                      value={selected.pricing[key]?.price || ""}
                                      onFocus={(e) => e.target.select()}
                                      onChange={e => {
                                        setForm(p => ({
                                          ...p,
                                          implements: p.implements.map(i =>
                                            i.subCategoryId === impl.id
                                              ? { ...i, pricing: { ...i.pricing, [key]: { ...i.pricing[key], price: parseFloat(e.target.value) || 0 } } }
                                              : i
                                          )
                                        }));
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Details Card (White) */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
           <div className="col-span-2 relative">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Title</label>
             <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black"
              placeholder="e.g. John Deere 5050D"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
             />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Model No</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black" value={form.modelNumber} onChange={e => setForm(p => ({ ...p, modelNumber: e.target.value }))} />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Mfg Year</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
           </div>
        </div>

        {/* Pricing Card (Emerald) */}
        <div className="bg-[#10B981] rounded-[32px] p-6 shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Pricing Model</p>
              <h2 className="text-white text-xl font-black tracking-tight">Rate Strategy</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiCreditCard className="text-white text-lg" />
            </div>
          </div>

          <div className="space-y-3">
            {['hourly', 'land_based', 'daily'].map(key => (
              <div key={key} className={`p-4 rounded-2xl transition-all duration-500 border ${form.pricing[key].isEnabled ? 'bg-white shadow-lg' : 'bg-white/10 border-white/10'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <p className={`text-[11px] font-black uppercase tracking-widest ${form.pricing[key].isEnabled ? 'text-emerald-700' : 'text-white'}`}>
                       {key === 'land_based' ? 'Per Acre' : key === 'hourly' ? 'Hourly' : 'Daily'}
                     </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setForm(p => ({ ...p, pricing: { ...p.pricing, [key]: { ...p.pricing[key], isEnabled: !p.pricing[key].isEnabled } } }))}
                    className={`w-10 h-5 rounded-full relative transition-all ${form.pricing[key].isEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.pricing[key].isEnabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {form.pricing[key].isEnabled && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-emerald-700 font-black text-xl">₹</span>
                    <input 
                      className="w-full bg-slate-100 border-none rounded-xl p-2 text-lg font-black text-emerald-900"
                      type="number"
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      value={form.pricing[key].price === 0 ? "" : form.pricing[key].price}
                      onChange={e => setForm(p => ({ ...p, pricing: { ...p.pricing, [key]: { ...p.pricing[key], price: parseFloat(e.target.value) || 0 } } }))}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Driver Card (Purple) */}
        <div className="bg-[#8B5CF6] rounded-[32px] p-6 shadow-xl shadow-purple-100">
           <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Operator Module</p>
              <h2 className="text-white text-xl font-black tracking-tight">Driver Profile</h2>
            </div>
              <div className="flex flex-col items-end">
                <button 
                  type="button"
                  onClick={() => {
                    if (!categoryMeta.requiresDriver) {
                      setForm(p => ({ ...p, includesDriver: !p.includesDriver }));
                    } else {
                      toast('This category requires a professional driver by policy.', { icon: '🛡️' });
                    }
                  }}
                  className={`w-12 h-6 rounded-full relative transition-all ${form.includesDriver ? 'bg-white' : 'bg-white/20'} ${categoryMeta.requiresDriver ? 'cursor-not-allowed' : ''}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${form.includesDriver ? 'right-1 bg-purple-600 shadow' : 'left-1 bg-white'}`} />
                </button>
                {categoryMeta.requiresDriver && (
                  <span className="text-[7px] font-black text-white/70 uppercase mt-1 tracking-widest">Mandatory Policy</span>
                )}
              </div>
          </div>

          <AnimatePresence>
            {form.includesDriver && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
                
                {/* Worker Link Toggle */}
                {!isEdit && vendorWorkers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowWorkerLink(!showWorkerLink)}
                      className="text-[10px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {showWorkerLink ? "← Back to Manual Entry" : "🔗 Link from Registered Workers"}
                    </button>
                    
                    {showWorkerLink && (
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        {vendorWorkers.map(w => (
                          <button
                            key={w._id}
                            type="button"
                            onClick={() => {
                              setForm(p => ({
                                ...p,
                                workerId: w._id,
                                driver: {
                                  ...p.driver,
                                  name: w.name,
                                  phone: w.phone,
                                  photo: w.profilePhoto || '',
                                  aadharNumber: w.aadhar?.number || '',
                                }
                              }));
                              setShowWorkerLink(false);
                              toast.success(`Linked to ${w.name}`);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${form.workerId === w._id ? 'bg-white border-white' : 'bg-white/10 border-white/20'}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                              {w.profilePhoto ? <img src={w.profilePhoto} className="w-full h-full object-cover" /> : <FiUser className="m-auto text-white/50" />}
                            </div>
                            <div className="text-left">
                              <p className={`text-xs font-black ${form.workerId === w._id ? 'text-purple-600' : 'text-white'}`}>{w.name}</p>
                              <p className={`text-[9px] font-bold ${form.workerId === w._id ? 'text-purple-400' : 'text-white/50'}`}>{w.phone}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer overflow-hidden p-1">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'driver')} />
                    {form.driver.photo ? <img src={form.driver.photo} className="w-full h-full object-cover rounded-xl" /> : <FiUser className="text-white " />}
                  </label>
                  <div className="flex-1 space-y-2">
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-black text-white placeholder:text-white/40" 
                      placeholder="Driver Name" 
                      value={form.driver.name} 
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setForm(p => ({ ...p, driver: { ...p.driver, name: val } }));
                      }} 
                    />
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-black text-white placeholder:text-white/40" type="tel" maxLength="10" placeholder="Phone Number" value={form.driver.phone} onChange={e => setForm(p => ({ ...p, driver: { ...p.driver, phone: e.target.value.replace(/\D/g, '') } }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <input className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-[10px] font-black text-white placeholder:text-white/40" type="tel" maxLength="12" placeholder="Aadhar Card" value={form.driver.aadharNumber} onChange={e => setForm(p => ({ ...p, driver: { ...p.driver, aadharNumber: e.target.value.replace(/\D/g, '') } }))} />
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-[10px] font-black text-white placeholder:text-white/40 uppercase" 
                      maxLength={16} 
                      placeholder="Driving License (Alphanumeric)" 
                      value={form.driver.licenseNumber} 
                      onChange={e => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        setForm(p => ({ ...p, driver: { ...p.driver, licenseNumber: val } }));
                      }} 
                    />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Visuals Selection (White Small) */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gallery Images</p>
           <div className="grid grid-cols-4 gap-3">
             {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-all"><FiTrash2 /></button>
                </div>
             ))}
             <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 cursor-pointer active:scale-95 transition-all">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
                {uploading ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <FiPlus className="text-slate-300" />}
             </label>
           </div>
        </div>

        {/* Large Launcher Button (Gradient) */}
        <button 
          type="submit"
          disabled={submitting}
          className="w-full py-6 bg-gradient-to-r from-slate-900 to-black text-white rounded-[32px] shadow-2xl shadow-slate-400/40 text-sm font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiActivity /> <span>Launch Listing</span></>}
        </button>

      </form>
    </div>
  );
};

export default AddEquipment;
