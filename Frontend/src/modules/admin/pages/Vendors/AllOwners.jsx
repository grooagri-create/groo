import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiDownload, FiLoader, FiPower, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CardShell from '../UserCategories/components/CardShell';
import Modal from '../UserCategories/components/Modal';
import adminVendorService from '../../../../services/adminVendorService';

const AllOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load owners from backend
  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const response = await adminVendorService.getAllVendors();
      if (response.success) {
        // Transform backend data to frontend format
        const transformedOwners = response.data.map(owner => ({
          id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          businessName: owner.businessName,
          service: owner.service,
          labDetails: owner.labDetails,
          approvalStatus: owner.approvalStatus,
          aadhar: owner.aadhar?.number,
          pan: owner.pan?.number,
          documents: {
            aadhar: owner.aadhar?.document,
            aadharBack: owner.aadhar?.backDocument,
            pan: owner.pan?.document,
            other: owner.otherDocuments?.[0]
          },
          createdAt: owner.createdAt,
          isActive: owner.isActive
        }));
        setOwners(transformedOwners);
      } else {
        toast.error(response.message || 'Failed to load owners');
      }
    } catch (error) {
      console.error('Error loading owners:', error);
      toast.error('Failed to load owners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = useMemo(() => {
    return owners.filter(owner => {
      const serviceString = Array.isArray(owner.service)
        ? owner.service.join(' ')
        : (owner.service || '');

      const matchesStatus = filterStatus === 'all' || owner.approvalStatus === filterStatus;

      const matchesSearch =
        owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.phone.includes(searchQuery) ||
        serviceString.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (owner.businessName && owner.businessName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [owners, filterStatus, searchQuery]);

  const handleApprove = async (ownerId) => {
    try {
      const response = await adminVendorService.approveVendor(ownerId);
      if (response.success) {
        setOwners(prev => prev.map(o =>
          o.id === ownerId ? { ...o, approvalStatus: 'approved' } : o
        ));
        toast.success('Owner approved successfully!');
      } else {
        toast.error(response.message || 'Failed to approve owner');
      }
    } catch (error) {
      console.error('Error approving owner:', error);
      toast.error('Failed to approve owner. Please try again.');
    }
  };

  const handleReject = async (ownerId) => {
    try {
      const response = await adminVendorService.rejectVendor(ownerId);
      if (response.success) {
        setOwners(prev => prev.map(o =>
          o.id === ownerId ? { ...o, approvalStatus: 'rejected' } : o
        ));
        toast.success('Owner rejected successfully.');
      } else {
        toast.error(response.message || 'Failed to reject owner');
      }
    } catch (error) {
      console.error('Error rejecting owner:', error);
      toast.error('Failed to reject owner. Please try again.');
    }
  };

  const handleToggleStatus = async (ownerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await adminVendorService.toggleStatus(ownerId, newStatus);
      if (response.success) {
        setOwners(prev => prev.map(o =>
          o.id === ownerId ? { ...o, isActive: newStatus } : o
        ));
        toast.success(`Owner ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update owner status');
      }
    } catch (error) {
      console.error('Error toggling owner status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleToggleSoilLab = async (ownerId, currentServices) => {
    try {
      const isCurrentlyLab = Array.isArray(currentServices) && currentServices.includes('soil_testing');
      let newServices = Array.isArray(currentServices) ? [...currentServices] : [];
      
      if (isCurrentlyLab) {
        newServices = newServices.filter(s => s !== 'soil_testing');
      } else {
        newServices.push('soil_testing');
      }

      const response = await adminVendorService.updateServices(ownerId, newServices);
      if (response.success) {
        setOwners(prev => prev.map(o =>
          o.id === ownerId ? { ...o, service: newServices } : o
        ));
        if (selectedOwner && selectedOwner.id === ownerId) {
          setSelectedOwner({ ...selectedOwner, service: newServices });
        }
        toast.success(`Owner marked as ${!isCurrentlyLab ? 'Soil Lab' : 'Standard Vendor'}`);
      } else {
        toast.error(response.message || 'Failed to update services');
      }
    } catch (error) {
      console.error('Error toggling soil lab status:', error);
      toast.error('Failed to update services');
    }
  };

  const handleDelete = async (ownerId) => {
    if (!window.confirm('Are you sure you want to delete this owner? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminVendorService.deleteVendor(ownerId);
      if (response.success) {
        setOwners(prev => prev.filter(o => o.id !== ownerId));
        toast.success('Owner deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete owner');
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
      toast.error('Failed to delete owner');
    }
  };

  const handleViewDetails = (owner) => {
    setSelectedOwner(owner);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = owners.filter(v => v.approvalStatus === 'pending').length;
  const approvedCount = owners.filter(v => v.approvalStatus === 'approved').length;
  const rejectedCount = owners.filter(v => v.approvalStatus === 'rejected').length;

  return (
    <div className="space-y-4">
      <CardShell
        icon={FiFilter}
        title="Equipment Owner Management"
        subtitle="Manage and verify platform equipment owners"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-1">Pending</div>
            <div className="text-xl font-bold text-yellow-900">{pendingCount}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Approved</div>
            <div className="text-xl font-bold text-green-900">{approvedCount}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Rejected</div>
            <div className="text-xl font-bold text-red-900">{rejectedCount}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search equipment owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Owner Details</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-500">Loading equipment owners...</td>
                  </tr>
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-500">No equipment owners found</td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{owner.name}</p>
                          <p className="text-[10px] text-gray-500">{owner.phone}</p>
                          <p className="text-[10px] text-gray-400">{owner.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-800 text-xs">{owner.businessName || 'N/A'}</p>
                          <p className="text-[10px] text-blue-600 font-medium">
                            {Array.isArray(owner.service) ? owner.service.join(', ') : (owner.service || 'No equipment')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${owner.approvalStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                          owner.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                          {owner.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(owner)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
 
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStatus(owner.id, owner.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${owner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={owner.isActive ? "Disable Login" : "Enable Login"}
                          >
                            <FiPower className={`w-3.5 h-3.5 ${owner.isActive ? 'fill-current' : ''}`} />
                          </button>
 
                          {/* Approve/Reject (Only for pending) */}
                          {owner.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(owner.id)}
                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(owner.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
 
                          {/* Delete Owner */}
                          <button
                            onClick={() => handleDelete(owner.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Owner"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardShell >

      {/* View Vendor Details Modal */}
      < Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOwner(null);
        }}
        title="Owner Details"
        size="lg"
      >
        {selectedOwner && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                <div className="text-gray-900">{selectedOwner.businessName || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                <div className="text-gray-900">{selectedOwner.name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{selectedOwner.email}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <div className="text-gray-900">{selectedOwner.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment Category</label>
                <div className="text-gray-900">
                  {Array.isArray(selectedOwner.service) ? selectedOwner.service.join(', ') : (selectedOwner.service || 'N/A')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <div>{getStatusBadge(selectedOwner.approvalStatus)}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered On</label>
                <div className="text-gray-900">
                  {new Date(selectedOwner.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Active</label>
                <div className={`text-sm font-semibold ${selectedOwner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOwner.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              {/* Soil Lab Verification */}
              <div className="col-span-2 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Soil Testing Lab Verification</h4>
                    <p className="text-xs text-gray-500">Allow this vendor to receive soil testing requests</p>
                  </div>
                  <button 
                    onClick={() => handleToggleSoilLab(selectedOwner.id, selectedOwner.service)}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{ backgroundColor: (Array.isArray(selectedOwner.service) && selectedOwner.service.includes('soil_testing')) ? '#10B981' : '#d1d5db' }}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${(Array.isArray(selectedOwner.service) && selectedOwner.service.includes('soil_testing')) ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                {selectedOwner.labDetails && (selectedOwner.labDetails.labName || selectedOwner.labDetails.licenseNumber) && (
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <span className="block text-xs text-gray-500">Registered Lab Name</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedOwner.labDetails.labName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">License Number</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedOwner.labDetails.licenseNumber || 'N/A'}</span>
                    </div>
                    {selectedOwner.labDetails.certificationDocument && (
                      <div className="col-span-2">
                         <span className="block text-xs text-gray-500 mb-1">Certification Document</span>
                         <a href={selectedOwner.labDetails.certificationDocument} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                           <FiEye className="w-3 h-3" /> View Document
                         </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
 
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Verification Documents</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedOwner.documents.aadhar && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Aadhar Front</label>
                    <img
                      src={selectedOwner.documents.aadhar}
                      alt="Aadhar Front"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedOwner.documents.aadhar}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
                {selectedOwner.documents.aadharBack && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Aadhar Back</label>
                    <img
                      src={selectedOwner.documents.aadharBack}
                      alt="Aadhar Back"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedOwner.documents.aadharBack}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
                {selectedOwner.documents.pan && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">PAN Card</label>
                    <img
                      src={selectedOwner.documents.pan}
                      alt="PAN"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedOwner.documents.pan}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>

            {selectedOwner.approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    await handleApprove(selectedOwner.id);
                    setIsViewModalOpen(false);
                    setSelectedOwner(null);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-5 h-5" />
                  Approve Owner
                </button>
                <button
                  onClick={async () => {
                    await handleReject(selectedOwner.id);
                    setIsViewModalOpen(false);
                    setSelectedOwner(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiX className="w-5 h-5" />
                  Reject Owner
                </button>
              </div>
            )}
          </div>
        )}
      </Modal >
    </div >
  );
};

export default AllOwners;
