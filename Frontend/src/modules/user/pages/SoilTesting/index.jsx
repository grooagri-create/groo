import React, { useState, useEffect } from 'react';
import {
    FiChevronLeft,
    FiMapPin,
    FiMaximize,
    FiSend,
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiInfo
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import soilTestService from '../../../../services/soilTestService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SoilTesting = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        landSize: '',
        location: localStorage.getItem('currentAddress') || '',
        cropType: '',
        phoneNumber: JSON.parse(localStorage.getItem('userData') || '{}').phone || ''
    });

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const res = await soilTestService.getMyRequests();
            if (res.success) setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await soilTestService.request(formData);
            if (res.success) {
                toast.success("Request submit ho gayi! Hum aapse jald hi contact karenge.");
                setShowForm(false);
                fetchMyRequests();
                setFormData({
                    landSize: '',
                    location: localStorage.getItem('currentAddress') || '',
                    cropType: '',
                    phoneNumber: JSON.parse(localStorage.getItem('userData') || '{}').phone || ''
                });
            }
        } catch (err) {
            toast.error("Submit nahi ho paya. Dobara koshish karein.");
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: "bg-amber-50 text-amber-600 border-amber-100",
            processing: "bg-blue-50 text-blue-600 border-blue-100",
            completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
            cancelled: "bg-slate-50 text-slate-400 border-slate-100"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F1F8E9] pb-24">
            {/* Navbar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-black/[0.03] flex items-center px-4 py-4 gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-xl">
                    <FiChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-slate-800 leading-tight">Soil Testing</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitti ki jaanch, behtar fasal</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-[#347989] to-[#255b68] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Apni mitti ki jaanch karayein</h2>
                        <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">Mitti ke poshak tatvon ko jaanein aur sahi khad ka upyog karein.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-white text-[#347989] px-6 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
                        >
                            Request Testing Now
                        </button>
                    </div>
                    {/* Decorative Elements */}
                    <FiActivity className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                            <FiCheckCircle className="text-teal-600" />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm mb-1">Authentic Lab</h3>
                        <p className="text-[10px] text-slate-400 font-bold leading-tight">Verified laboratories for accurate reports.</p>
                    </div>
                    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                            <FiClock className="text-amber-600" />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm mb-1">Fast Result</h3>
                        <p className="text-[10px] text-slate-400 font-bold leading-tight">Get your soil report within 3-5 working days.</p>
                    </div>
                </div>

                {/* Previous Requests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Meri Requests</h2>
                        <FiFileText className="text-slate-400" />
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center">
                            <FiInfo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="font-black text-slate-800">Abhi tak koi request nahi hain</p>
                            <p className="text-xs text-slate-400 font-medium">Behtar fasal ke liye mitti ki jaanch zaroori hai.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req._id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Request ID: {req._id.slice(-8)}</p>
                                            <h4 className="font-black text-slate-800 text-base">{req.landSize} Land - {req.cropType || 'General'}</h4>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                                        <FiMapPin className="flex-shrink-0" />
                                        <p className="text-xs font-bold truncate">{req.location}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        {req.reportUrl && (
                                            <a href={req.reportUrl} target="_blank" rel="noreferrer" className="text-teal-600 font-black text-xs uppercase hover:underline">Download Report</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white w-full max-h-[90vh] rounded-t-[48px] shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Soil Test Form</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sahi details bharein</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Land Size (Acre/Bigha)</label>
                                        <div className="relative">
                                            <FiMaximize className="absolute left-4 top-4 text-slate-300" />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-5 font-bold outline-none"
                                                placeholder="e.g. 5 Acre"
                                                value={formData.landSize}
                                                onChange={e => setFormData({ ...formData, landSize: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Address</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-4 top-4 text-slate-300" />
                                            <textarea
                                                required
                                                rows="3"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-5 font-bold outline-none"
                                                placeholder="Apna pura pata likhein"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Crop (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none"
                                                placeholder="Kaunsi fasal ugayenge?"
                                                value={formData.cropType}
                                                onChange={e => setFormData({ ...formData, cropType: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                            <input
                                                required
                                                type="tel"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none"
                                                value={formData.phoneNumber}
                                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-teal-50 p-6 rounded-[32px] flex gap-4 items-start border border-teal-100/50">
                                    <FiInfo className="text-teal-600 flex-shrink-0 mt-1" />
                                    <p className="text-xs font-bold text-teal-900 leading-relaxed">
                                        Hamari team aapse sampark karegi aur aapke khet se mitti ka sample degi. Lab report aane par aapko notification mil jayega.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#347989] py-5 rounded-[32px] font-black text-white shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : <><FiSend /> Submit Request</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default SoilTesting;
