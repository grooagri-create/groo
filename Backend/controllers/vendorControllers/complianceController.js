const Vendor = require('../../models/Vendor');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * Get Compliance Status for Documents
 * GET /api/vendors/compliance/status
 */
const getComplianceStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await Vendor.findById(vendorId).select('complianceDocuments');

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const docs = vendor.complianceDocuments || {};
        const today = new Date();
        const alertThreshold = 30; // 30 days notice

        const statusMap = {};
        const alerts = [];

        const checkDoc = (name, doc) => {
            if (!doc || !doc.expiryDate) {
                statusMap[name] = { status: 'PENDING', message: 'Not Uploaded' };
                return;
            }

            const expiry = new Date(doc.expiryDate);
            const diffTime = expiry - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                statusMap[name] = { status: 'EXPIRED', days: diffDays, message: 'Expired' };
                alerts.push({ type: 'CRITICAL', message: `Your ${name.replace(/([A-Z])/g, ' $1')} has expired!`, document: name });
            } else if (diffDays <= alertThreshold) {
                statusMap[name] = { status: 'EXPIRING_SOON', days: diffDays, message: `Expiring in ${diffDays} days` };
                alerts.push({ type: 'WARNING', message: `Your ${name.replace(/([A-Z])/g, ' $1')} is expiring in ${diffDays} days.`, document: name });
            } else {
                statusMap[name] = { status: 'VALID', days: diffDays, message: 'Valid' };
            }
        };

        checkDoc('drivingLicense', docs.drivingLicense);
        checkDoc('rcBook', docs.rcBook);
        checkDoc('insurance', docs.insurance);
        checkDoc('fitnessCertificate', docs.fitnessCertificate);

        res.status(200).json({
            success: true,
            data: {
                documents: docs,
                status: statusMap,
                alerts
            }
        });
    } catch (error) {
        console.error('Compliance Status Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch compliance status' });
    }
};

/**
 * Update Compliance Document
 * POST /api/vendors/compliance/update
 */
const updateComplianceDocument = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { type, number, document, expiryDate } = req.body;

        const validTypes = ['drivingLicense', 'rcBook', 'insurance', 'fitnessCertificate'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid document type' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        let documentUrl = document;
        if (document && document.startsWith('data:')) {
            const uploadRes = await cloudinaryService.uploadFile(document, { folder: 'vendors/compliance' });
            if (uploadRes.success) documentUrl = uploadRes.url;
        }

        if (!vendor.complianceDocuments) vendor.complianceDocuments = {};

        vendor.complianceDocuments[type] = {
            number: number || vendor.complianceDocuments[type]?.number,
            document: documentUrl || vendor.complianceDocuments[type]?.document,
            expiryDate: expiryDate ? new Date(expiryDate) : vendor.complianceDocuments[type]?.expiryDate
        };

        await vendor.save();

        res.status(200).json({
            success: true,
            message: `${type.replace(/([A-Z])/g, ' $1')} updated successfully`,
            data: vendor.complianceDocuments[type]
        });
    } catch (error) {
        console.error('Update Compliance Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update document' });
    }
};

module.exports = {
    getComplianceStatus,
    updateComplianceDocument
};
