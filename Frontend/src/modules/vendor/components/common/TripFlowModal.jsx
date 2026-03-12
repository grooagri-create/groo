import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCamera, FiX, FiCheck, FiUpload, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../../../../services/cloudinaryService';

/**
 * TripFlowModal - Handles Start Trip / End Trip flow
 * Step 1: Open Camera → Take KM Photo
 * Step 2: Enter Farmer's OTP
 * Step 3: Submit
 *
 * Props:
 *   isOpen     {boolean}
 *   onClose    {() => void}
 *   mode       {'start' | 'end'}
 *   onSubmit   {(photoUrl: string, otp: string, workUnits?: number) => Promise<void>}
 *   rentalType {string} 'hourly' | 'land_based' | 'monthly'
 */
const TripFlowModal = ({ isOpen, onClose, mode = 'start', onSubmit, rentalType }) => {
    const [step, setStep] = useState(1); // 1 = Photo, 2 = OTP
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [workUnits, setWorkUnits] = useState(''); // Acres covered
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];

    const isStart = mode === 'start';
    const title = isStart ? '🚜 Start Trip' : '🏁 End Trip';
    const photoLabel = isStart ? 'Starting Kilometer Photo' : 'Ending Kilometer Photo';
    const themeColor = isStart ? '#16a34a' : '#dc2626'; // green for start, red for end

    // Reset state when modal closes / reopens
    const handleClose = () => {
        setStep(1);
        setPhotoPreview(null);
        setPhotoFile(null);
        setOtp(['', '', '', '']);
        setWorkUnits('');
        setUploading(false);
        setSubmitting(false);
        onClose();
    };

    // Handle photo selection (camera or gallery)
    const handlePhotoCapture = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    // OTP input logic
    const handleOtpChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[idx] = val;
        setOtp(newOtp);
        if (val && idx < 3) otpRefs[idx + 1].current?.focus();
    };
    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs[idx - 1].current?.focus();
        }
    };

    // Go to Step 2: Upload photo to Cloudinary
    const handleProceedToOtp = async () => {
        if (!photoFile) return toast.error('Please take a KM photo first');
        try {
            setUploading(true);
            const url = await uploadToCloudinary(photoFile);
            setPhotoFile(url); // store URL instead of file after upload
            setStep(2);
        } catch (err) {
            toast.error('Photo upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    // Final Submit
    const handleSubmit = async () => {
        const otpStr = otp.join('');
        if (otpStr.length !== 4) return toast.error('Enter 4-digit OTP from farmer');
        if (!photoFile) return toast.error('KM Photo not uploaded');
        if (!isStart && rentalType === 'land_based' && !workUnits) return toast.error('Please enter total acres covered');

        try {
            setSubmitting(true);
            await onSubmit(photoFile, otpStr, workUnits ? parseFloat(workUnits) : undefined);
            handleClose();
        } catch (err) {
            toast.error(err?.message || 'Failed to submit. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-3"
                            style={{ borderBottom: `3px solid ${themeColor}` }}>
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Step {step} of 2: {step === 1 ? 'Take KM Photo' : 'Enter Farmer OTP'}
                                </p>
                            </div>
                            <button onClick={handleClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex gap-1.5 px-5 pt-3">
                            {[1, 2].map(s => (
                                <div key={s} className="flex-1 h-1 rounded-full transition-all"
                                    style={{ background: step >= s ? themeColor : '#e5e7eb' }} />
                            ))}
                        </div>

                        <div className="px-5 py-5 space-y-4">

                            {/* === STEP 1: KM PHOTO === */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                    <p className="text-sm font-semibold text-gray-700">{photoLabel}</p>

                                    {/* Photo Preview / Camera Button */}
                                    {photoPreview ? (
                                        <div className="relative">
                                            <img src={photoPreview} alt="KM" className="w-full h-52 object-cover rounded-2xl border-2 border-gray-200" />
                                            <button
                                                onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md">
                                                <FiRefreshCw className="w-4 h-4 text-gray-700" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all active:scale-95"
                                            style={{ borderColor: themeColor, background: `${themeColor}08` }}>
                                            <FiCamera className="w-10 h-10" style={{ color: themeColor }} />
                                            <p className="text-sm font-bold" style={{ color: themeColor }}>Tap to Open Camera</p>
                                            <p className="text-[10px] text-gray-400">Take a clear photo of the odometer/meter</p>
                                        </button>
                                    )}

                                    {/* Hidden file input - camera capture */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handlePhotoCapture}
                                    />

                                    <button
                                        onClick={handleProceedToOtp}
                                        disabled={!photoPreview || uploading}
                                        className="w-full py-4 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                        style={{ background: themeColor }}>
                                        {uploading
                                            ? <><FiLoader className="w-4 h-4 animate-spin" /> Uploading Photo...</>
                                            : <><FiUpload className="w-4 h-4" /> Upload & Continue</>}
                                    </button>
                                </motion.div>
                            )}

                            {/* === STEP 2: OTP === */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                    {/* Uploaded photo thumbnail */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <p className="text-xs font-semibold text-gray-700">KM Photo uploaded successfully ✅</p>
                                    </div>

                                    {/* Additional Input for Land Based (Step 2) */}
                                    {!isStart && rentalType === 'land_based' && (
                                        <div className="space-y-2 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                                            <p className="text-sm font-bold text-yellow-800">Total Work Finished</p>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={workUnits}
                                                    onChange={(e) => setWorkUnits(e.target.value)}
                                                    placeholder="Enter total acres covered..."
                                                    className="w-full py-4 px-4 bg-white border-2 border-yellow-300 rounded-xl focus:outline-none text-lg font-bold text-yellow-900"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-yellow-600">Acres</span>
                                            </div>
                                            <p className="text-[10px] text-yellow-700 italic">Bill will be calculated based on {workUnits || '0'} acres.</p>
                                        </div>
                                    )}

                                    {/* OTP Input */}
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-bold text-gray-800">Enter Farmer's OTP</p>
                                        <p className="text-[11px] text-gray-500">Ask the farmer for their {isStart ? '4-digit Start' : '4-digit End'} OTP</p>
                                        <div className="flex justify-center gap-3 mt-4">
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={otpRefs[idx]}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                    className="w-14 h-14 text-center text-2xl font-extrabold border-2 rounded-xl focus:outline-none transition-all"
                                                    style={{
                                                        borderColor: digit ? themeColor : '#e5e7eb',
                                                        color: themeColor
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setStep(1)}
                                            className="flex-1 py-3.5 rounded-2xl border-2 font-bold text-sm text-gray-600 border-gray-300 transition-all active:scale-95">
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={otp.join('').length < 4 || submitting}
                                            className="flex-1 py-3.5 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                            style={{ background: themeColor }}>
                                            {submitting
                                                ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                                                : <><FiCheck className="w-4 h-4" /> Confirm {isStart ? 'Start' : 'End'} Trip</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TripFlowModal;
