import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiSearch, FiFilter, FiTruck, FiClock, FiCheckCircle, FiAlertCircle, FiEye } from "react-icons/fi";
import { FaTractor } from "react-icons/fa";
import { toast } from "react-hot-toast";
import adminProductService from "../../../../../services/adminProductService";
import Modal from "../components/Modal";

/**
 * VendorServicesPage — plan2.txt Step 4
 * Shows all vendor-submitted equipment (tractors, harvesters, etc.)
 * Admin can Approve → equipment goes live on farmer app
 * Admin can Reject → vendor is notified
 */
const VendorServicesPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState(null); // { id, title }
    const [rejectReason, setRejectReason] = useState('');
    const [viewModal, setViewModal] = useState(null); // Stores full equipment object

    useEffect(() => {
        loadEquipment();
    }, [filterStatus]);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const response = await adminProductService.getVendorEquipment(filterStatus);
            if (response.success) setEquipment(response.data || []);
        } catch (error) {
            toast.error('Failed to load vendor equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, title) => {
        try {
            setActionLoading(id);
            const response = await adminProductService.approveEquipment(id);
            if (response.success) {
                toast.success(`✅ ${title} approved! Now live on farmer app.`);
                setEquipment(prev => prev.map(e => e._id === id ? { ...e, approvalStatus: 'approved' } : e));
            }
        } catch (error) {
            toast.error('Failed to approve equipment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectModal) return;
        try {
            setActionLoading(rejectModal.id);
            const response = await adminProductService.rejectEquipment(rejectModal.id, rejectReason);
            if (response.success) {
                toast.success(`Equipment rejected.`);
                setEquipment(prev => prev.map(e => e._id === rejectModal.id ? { ...e, approvalStatus: 'rejected', rejectionReason: rejectReason } : e));
                setRejectModal(null);
                setRejectReason('');
            }
        } catch (error) {
            toast.error('Failed to reject equipment');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = equipment.filter(eq => {
        const term = searchTerm.toLowerCase();
        return (
            eq.title?.toLowerCase().includes(term) ||
            eq.brandName?.toLowerCase().includes(term) ||
            (eq.vendorId?.name || '').toLowerCase().includes(term) ||
            (eq.vendorId?.businessName || '').toLowerCase().includes(term)
        );
    });

    const counts = {
        all: equipment.length,
        pending: equipment.filter(e => e.approvalStatus === 'pending_approval').length,
        approved: equipment.filter(e => e.approvalStatus === 'approved').length,
        rejected: equipment.filter(e => e.approvalStatus === 'rejected').length,
    };

    const statusConfig = {
        pending_approval: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <FaTractor className="text-green-700 text-lg" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Vendor Equipment Approval</h2>
                    <p className="text-xs text-gray-500">Plan2.txt Step 4 — Review & approve vendor-submitted machinery</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'All Equipment', count: counts.all, icon: FiTruck, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Pending Review', count: counts.pending, icon: FiClock, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: 'Approved', count: counts.approved, icon: FiCheckCircle, color: 'bg-green-50 border-green-200 text-green-700' },
                    { label: 'Rejected', count: counts.rejected, icon: FiAlertCircle, color: 'bg-red-50 border-red-200 text-red-700' },
                ].map(({ label, count, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl border p-3 ${color}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                        </div>
                        <div className="text-2xl font-black">{count}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by equipment name, brand, or vendor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { value: '', label: 'All' },
                        { value: 'pending_approval', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setFilterStatus(value)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === value ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Equipment Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Equipment</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Equipment Owner</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-500">Loading equipment...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <FaTractor className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 font-medium">No equipment found</p>
                                        <p className="text-xs text-gray-400 mt-1">Vendors will appear here once they add equipment from their panel</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((eq) => {
                                    const status = statusConfig[eq.approvalStatus] || statusConfig.pending_approval;
                                    return (
                                        <tr key={eq._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {eq.imageUrl ? (
                                                        <img src={eq.imageUrl} alt={eq.title} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                                                            <FaTractor className="text-green-500 text-xl" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{eq.title}</p>
                                                        <p className="text-[10px] text-gray-400">{eq.brandName || 'No Brand'} • {eq.categoryId?.title || 'Uncategorized'}</p>
                                                        {eq.specifications?.slice(0, 2).map((s, i) => (
                                                            <span key={i} className="text-[9px] text-gray-400 mr-1">{s.name}: {s.value}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-800">{eq.vendorId?.businessName || eq.vendorId?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-400">{eq.vendorId?.phone || '—'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-bold text-gray-900">₹{eq.price?.toLocaleString('en-IN')}</p>
                                                <p className="text-[10px] text-gray-400">per {eq.unit || 'day'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                {eq.approvalStatus === 'rejected' && eq.rejectionReason && (
                                                    <p className="text-[9px] text-red-500 mt-1 max-w-[120px] truncate">{eq.rejectionReason}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewModal(eq)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    {eq.approvalStatus === 'pending_approval' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(eq._id, eq.title)}
                                                                disabled={actionLoading === eq._id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                                            >
                                                                <FiCheck className="w-3 h-3" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => { setRejectModal({ id: eq._id, title: eq.title }); setRejectReason(''); }}
                                                                disabled={actionLoading === eq._id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-all disabled:opacity-50"
                                                            >
                                                                <FiX className="w-3 h-3" /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {eq.approvalStatus === 'approved' && (
                                                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                                            <FiCheckCircle className="w-4 h-4" /> Live
                                                        </span>
                                                    )}
                                                    {eq.approvalStatus === 'rejected' && (
                                                        <button
                                                            onClick={() => handleApprove(eq._id, eq.title)}
                                                            disabled={actionLoading === eq._id}
                                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all"
                                                        >
                                                            Re-Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Reason Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="font-black text-gray-900 text-lg mb-1">Reject Equipment</h3>
                        <p className="text-sm text-gray-500 mb-4">Provide a reason for rejecting <strong>{rejectModal.title}</strong></p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Equipment details are incomplete, Photos are unclear..."
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-28 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            <Modal
                isOpen={!!viewModal}
                onClose={() => setViewModal(null)}
                title="Equipment Details"
                size="lg"
            >
                {viewModal && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                            viewModal.approvalStatus === 'approved' ? 'bg-green-50 border-green-100 text-green-700' :
                            viewModal.approvalStatus === 'rejected' ? 'bg-red-50 border-red-100 text-red-700' :
                            'bg-yellow-50 border-yellow-100 text-yellow-700'
                        }`}>
                            <div className="flex items-center gap-2">
                                {viewModal.approvalStatus === 'approved' ? <FiCheckCircle /> : viewModal.approvalStatus === 'rejected' ? <FiAlertCircle /> : <FiClock />}
                                <span className="text-sm font-bold uppercase tracking-wider">
                                    Status: {viewModal.approvalStatus === 'pending_approval' ? 'Pending Review' : viewModal.approvalStatus}
                                </span>
                            </div>
                            <span className="text-xs font-bold">₹{viewModal.price} per {viewModal.unit}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Images */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Photos</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[viewModal.imageUrl, ...(viewModal.images || [])].filter(Boolean).map((img, i) => (
                                        <div key={i} className={`rounded-xl overflow-hidden border border-gray-100 ${i === 0 ? 'col-span-2' : ''}`}>
                                            <img src={img} alt={`Slide ${i}`} className="w-full h-48 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">General Info</label>
                                    <h4 className="text-xl font-black text-gray-900">{viewModal.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{viewModal.description || 'No description provided.'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Brand</label>
                                        <p className="text-sm font-bold text-gray-800">{viewModal.brandName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                                        <p className="text-sm font-bold text-gray-800">{viewModal.categoryId?.title || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Specifications</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {viewModal.specifications && viewModal.specifications.length > 0 ? (
                                            viewModal.specifications.map((spec, i) => (
                                                <div key={i} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{spec.name}</p>
                                                    <p className="text-xs font-bold text-gray-700">{spec.value}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No specifications listed</p>
                                        )}
                                    </div>
                                </div>

                                {viewModal.hasDriver && (
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Driver Details</label>
                                        <div className="flex items-center gap-3">
                                            {viewModal.driverDetails?.photo && (
                                                <img src={viewModal.driverDetails.photo} alt="Driver" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{viewModal.driverDetails?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-500">License: {viewModal.driverDetails?.licenseNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions in Modal Section */}
                        {viewModal.approvalStatus === 'pending_approval' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => { handleApprove(viewModal._id, viewModal.title); setViewModal(null); }}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                                >
                                    <FiCheck /> Approve Machine
                                </button>
                                <button
                                    onClick={() => { setRejectModal({ id: viewModal._id, title: viewModal.title }); setViewModal(null); }}
                                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-all"
                                >
                                    <FiX /> Reject Machine
                                </button>
                            </div>
                        )}
                        
                        {viewModal.approvalStatus === 'rejected' && viewModal.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <label className="block text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Rejection Reason</label>
                                <p className="text-sm text-red-700 font-medium">{viewModal.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VendorServicesPage;
