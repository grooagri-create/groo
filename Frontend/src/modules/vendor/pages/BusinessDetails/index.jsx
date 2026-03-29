import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';

const BusinessDetails = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [isSoilLab, setIsSoilLab] = useState(false);
  const [labName, setLabName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certDoc, setCertDoc] = useState('');
  const [certPreview, setCertPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load from local storage first
    const storedVendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
    if (storedVendorData && Object.keys(storedVendorData).length > 0) {
      setProfile(storedVendorData);
      
      const hasSoilTesting = Array.isArray(storedVendorData.service) 
        ? storedVendorData.service.includes('soil_testing')
        : storedVendorData.service === 'soil_testing';
        
      setIsSoilLab(hasSoilTesting);
      
      if (storedVendorData.labDetails) {
        setLabName(storedVendorData.labDetails.labName || '');
        setLicenseNumber(storedVendorData.labDetails.licenseNumber || '');
        setCertPreview(storedVendorData.labDetails.certificationDocument || '');
      }
      setIsLoading(false);
    }

    // Then fetch fresh data
    const fetchProfile = async () => {
      try {
        const response = await vendorAuthService.getProfile();
        if (response.success && response.vendor) {
          const v = response.vendor;
          setProfile(v);
          
          const hasSoilTesting = Array.isArray(v.service) 
            ? v.service.includes('soil_testing')
            : v.service === 'soil_testing';
            
          setIsSoilLab(hasSoilTesting);
          
          if (v.labDetails) {
            setLabName(v.labDetails.labName || '');
            setLicenseNumber(v.labDetails.licenseNumber || '');
            setCertPreview(v.labDetails.certificationDocument || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertDoc(reader.result);
        setCertPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    let validationErrors = {};
    if (isSoilLab) {
      if (!labName.trim()) {
        validationErrors.labName = 'Lab Name is required';
      } else if (labName.trim().length < 3) {
        validationErrors.labName = 'Lab Name must be at least 3 characters';
      } else if (!/^[A-Za-z0-9\s&*.,-]+$/.test(labName.trim())) {
        validationErrors.labName = 'Special characters are not allowed';
      }
      
      if (!licenseNumber.trim()) {
        validationErrors.licenseNumber = 'License Number is required';
      } else if (licenseNumber.trim().length < 4) {
        validationErrors.licenseNumber = 'License Number must be at least 4 characters';
      } else if (!/^[A-Za-z0-9-\s]+$/.test(licenseNumber.trim())) {
        validationErrors.licenseNumber = 'Only alphanumeric characters and hyphens allowed';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form.');
      return;
    }

    setErrors({});
    setIsSaving(true);
    
    try {
      // Calculate new services array
      let currentServices = Array.isArray(profile.service) 
        ? [...profile.service] 
        : (profile.service ? [profile.service] : []);
        
      if (isSoilLab && !currentServices.includes('soil_testing')) {
        currentServices.push('soil_testing');
      } else if (!isSoilLab && currentServices.includes('soil_testing')) {
        currentServices = currentServices.filter(s => s !== 'soil_testing');
      }

      const updateData = {
        services: currentServices
      };

      if (isSoilLab) {
        updateData.labName = labName;
        updateData.licenseNumber = licenseNumber;
        if (certDoc) {
          updateData.certificationDocument = certDoc;
        }
      }

      const response = await vendorAuthService.updateBusinessProfile(updateData);
      
      if (response.success) {
        toast.success('Business Profile updated successfully!');
        if (isSoilLab) {
           toast.success('Admin will verify your Lab details before you can receive requests.', { duration: 4000 });
        }
        navigate('/vendor/profile', { replace: true });
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Server error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.button }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6" style={{ background: themeColors.backgroundGradient }}>
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl active:bg-gray-100 transition-colors">
          <FiArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">Business Profile</h1>
      </div>

      <main className="p-4 space-y-6">
        
        {/* Intro */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-2">Service Opt-in</h2>
          <p className="text-xs text-gray-500 mb-5">
            Manage additional services you offer. By enabling "Soil Testing", you will be listed as a Soil Lab pending admin verification.
          </p>

          {/* Toggle Soil Lab */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300"
               style={{ 
                 borderColor: isSoilLab ? themeColors.button : '#e5e7eb',
                 backgroundColor: isSoilLab ? `${themeColors.button}10` : 'white'
               }}>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Operate as Soil Testing Lab</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Accept soil samples for testing</p>
            </div>
            
            {/* Custom Toggle switch */}
            <button 
              onClick={() => setIsSoilLab(!isSoilLab)}
              className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              style={{ backgroundColor: isSoilLab ? themeColors.button : '#d1d5db' }}
            >
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSoilLab ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Soil Lab Details Form (Conditionally rendered) */}
        {isSoilLab && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FiCheckCircle className="w-5 h-5" style={{ color: themeColors.button }} />
              <h2 className="text-base font-bold text-gray-800">Lab Details</h2>
            </div>
            
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ml-1 ${errors.labName ? 'text-red-500' : 'text-gray-700'}`}>Lab Name *</label>
              <input 
                type="text" 
                value={labName}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^A-Za-z0-9\s&*.,-]/g, '');
                  setLabName(val);
                  if (errors.labName && val.length >= 3) setErrors({ ...errors, labName: null });
                }}
                onBlur={() => {
                   if(isSoilLab && labName.trim() && labName.trim().length < 3) {
                       setErrors(prev => ({...prev, labName: 'Lab Name must be at least 3 characters'}));
                   }
                }}
                placeholder="Enter Registered Lab Name"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-sm focus:outline-none text-gray-800 ${
                  errors.labName 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'bg-gray-50 border-transparent focus:border-teal-100 focus:bg-white'
                }`}
              />
              {errors.labName && <p className="text-[10px] text-red-500 mt-1 ml-1 font-semibold">{errors.labName}</p>}
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ml-1 ${errors.licenseNumber ? 'text-red-500' : 'text-gray-700'}`}>License/Registration Number *</label>
              <input 
                type="text" 
                value={licenseNumber}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^A-Za-z0-9-\s]/g, '').toUpperCase();
                  setLicenseNumber(val);
                  if (errors.licenseNumber && val.length >= 4) setErrors({ ...errors, licenseNumber: null });
                }}
                onBlur={() => {
                   if(isSoilLab && licenseNumber.trim() && licenseNumber.trim().length < 4) {
                       setErrors(prev => ({...prev, licenseNumber: 'License Number must be at least 4 characters'}));
                   }
                }}
                placeholder="e.g. LAB-2023-XXXX"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-sm focus:outline-none text-gray-800 ${
                  errors.licenseNumber 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'bg-gray-50 border-transparent focus:border-teal-100 focus:bg-white'
                }`}
              />
              {errors.licenseNumber && <p className="text-[10px] text-red-500 mt-1 ml-1 font-semibold">{errors.licenseNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Certification Document (Image/PDF)</label>
              <div className="relative">
                <input
                  type="file"
                  id="certUpload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                
                {certPreview ? (
                  <div className="relative w-full rounded-xl overflow-hidden border-2 border-gray-100" style={{ height: '140px' }}>
                    {certPreview.includes('application/pdf') ? (
                       <div className="w-full h-full flex items-center justify-center bg-gray-50 flex-col gap-2">
                         <FiUploadCloud className="w-8 h-8 text-gray-400" />
                         <span className="text-xs text-gray-500">PDF Uploaded</span>
                       </div>
                    ) : (
                      <img src={certPreview} alt="Certification" className="w-full h-full object-cover" />
                    )}
                    <label 
                      htmlFor="certUpload" 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">Change File</span>
                    </label>
                  </div>
                ) : (
                  <label 
                    htmlFor="certUpload"
                    className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <FiUploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold text-teal-600">Upload a file</span> or drag and drop
                      </div>
                      <p className="text-[10px] text-gray-500">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mt-2">
              <p className="text-[11px] text-blue-700 leading-relaxed">
                <span className="font-bold">Note:</span> Enabling Soil Testing mode requires admin verification. You will be categorized as pending until approved.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Save Button */}
      <div className="px-4 pb-8 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            backgroundColor: isSaving ? '#6b7280' : themeColors.button,
            opacity: isSaving ? 0.7 : 1,
            boxShadow: `0 8px 16px ${hexToRgba(themeColors.button, 0.25)}`
          }}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              Save Business Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Helper function
const hexToRgba = (hex, alpha) => {
  if (!hex) return '';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default BusinessDetails;
