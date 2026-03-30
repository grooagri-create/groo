import React, { useState, useEffect } from 'react';
import { 
    FiPackage, 
    FiTruck, 
    FiClock, 
    FiCheckCircle, 
    FiSearch,
    FiFilter,
    FiChevronLeft
} from 'react-icons/fi';
import adminProductService from '../../../../services/adminProductService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EcommerceOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await adminProductService.getEcommerceOrders();
            if (res.success) setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load global orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.vendorId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <FiChevronLeft className="w-5 h-5 text-slate-800" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Global Ecommerce Orders</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitor all physical product sales & fulfillment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><FiPackage /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                        <p className="text-2xl font-black text-slate-800">{orders.length}</p>
                    </div>
                </div>
                <div className="md:col-span-2 bg-white px-6 py-2 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-3">
                    <FiSearch className="text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID, Farmer Name, or Vendor Shop..." 
                        className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order / Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer & Address</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor / Shop</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value (Split)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-10 bg-slate-50/30"></td></tr>)
                            ) : currentOrders.map(order => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-800 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-800 text-sm">{order.userId?.name || 'Unknown'}</p>
                                        <p className="text-[10px] font-medium text-slate-500 line-clamp-1 max-w-[200px] mt-1">
                                            {typeof order.shippingAddress === 'object' && order.shippingAddress ? (() => {
                                                const a = order.shippingAddress;
                                                const parts = [a.addressLine1, a.city, a.state, a.pincode].filter(Boolean);
                                                return parts.length > 0 ? parts.join(', ') : 'No Address';
                                            })() : (order.shippingAddress || 'No Address')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-800 text-sm">{order.vendorId?.businessName || 'N/A'}</p>
                                        <p className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-tighter">V: {order.vendorId?.name}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-slate-800">Total: ₹{order.pricing?.itemsTotal}</p>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    Fee: ₹{order.pricing?.platformFee} ({order.paymentStatus})
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase">
                                                    Vend: ₹{order.pricing?.vendorBalance}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                order.deliveryStatus === 'delivered' ? 'bg-green-500' : 
                                                order.deliveryStatus === 'shipped' ? 'bg-blue-500' : 'bg-orange-500'
                                            }`} />
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{order.deliveryStatus}</p>
                                        </div>
                                        {order.trackingDetails?.courierName && (
                                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                                {order.trackingDetails.courierName}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-zinc-50/50">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page:</label>
                                <select 
                                    className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer py-1 px-2"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing size
                                    }}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EcommerceOrders;
