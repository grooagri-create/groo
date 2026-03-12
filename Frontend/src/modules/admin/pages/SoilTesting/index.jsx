import React, { useState, useEffect } from 'react';
import {
    FiSearch,
    FiFilter,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiDownload,
    FiUser,
    FiMapPin,
    FiActivity
} from 'react-icons/fi';
import adminSoilTestService from '../../../../services/adminSoilTestService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManageSoilTests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [editData, setEditData] = useState({
        status: '',
        adminNotes: '',
        reportUrl: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await adminSoilTestService.getAll();
            if (res.success) setRequests(res.data);
        } catch (err) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await adminSoilTestService.update(selectedRequest._id, editData);
            if (res.success) {
                toast.success("Request updated successfully");
                setShowModal(false);
                fetchRequests();
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const res = await adminSoilTestService.delete(id);
            if (res.success) {
                toast.success("Request deleted");
                fetchRequests();
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const openEdit = (req) => {
        setSelectedRequest(req);
        setEditData({
            status: req.status,
            adminNotes: req.adminNotes || '',
            reportUrl: req.reportUrl || ''
        });
        setShowModal(true);
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            (req.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            req._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        processing: requests.filter(r => r.status === 'processing').length,
        completed: requests.filter(r => r.status === 'completed').length
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Manage Soil Tests</h1>
                    <p className="text-slate-500 font-medium">Review and process farmer soil testing requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Requests', value: stats.total, color: 'slate', icon: FiActivity },
                    { label: 'Pending', value: stats.pending, color: 'amber', icon: FiClock },
                    { label: 'Processing', value: stats.processing, color: 'blue', icon: FiActivity },
                    { label: 'Completed', value: stats.completed, color: 'emerald', icon: FiCheckCircle },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-600 w-6 h-6`} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8 flex gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Farmar Name or Request ID..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-5 font-bold outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <FiFilter className="text-slate-400" />
                    <select
                        className="bg-slate-50 border-none rounded-2xl py-3.5 px-6 font-bold outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Date</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">Loading requests...</td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">No requests found.</td></tr>
                        ) : (
                            filteredRequests.map(req => (
                                <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                                                <FiUser className="text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800">{req.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs font-bold text-slate-400">{req.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-bold text-slate-800 text-sm">{req.landSize} - {req.cropType || 'General'}</p>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <FiMapPin className="text-[10px]" />
                                            <p className="text-[10px] font-medium truncate max-w-[200px]">{req.location}</p>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-slate-500 text-sm">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border 
                                            ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(req)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-800 transition-colors">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(req._id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 transition-colors">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10">
                            <h2 className="text-2xl font-black text-slate-800 mb-8">Process Request</h2>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none"
                                        value={editData.status}
                                        onChange={e => setEditData({ ...editData, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Notes</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-medium outline-none"
                                        placeholder="Add notes for farmer..."
                                        value={editData.adminNotes}
                                        onChange={e => setEditData({ ...editData, adminNotes: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Report URL (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold outline-none"
                                        placeholder="Link to PDF/Image report"
                                        value={editData.reportUrl}
                                        onChange={e => setEditData({ ...editData, reportUrl: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 active:scale-95 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-teal-600 shadow-lg shadow-teal-600/20 active:scale-95 transition-all">Update Request</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageSoilTests;
