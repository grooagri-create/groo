const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF
 * @param {Object} bill - VendorBill document
 * @param {Object} booking - Booking document
 * @param {Stream} res - Express response stream
 */
const generateInvoicePDF = (bill, booking, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Pipe to response
    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#444444')
        .fontSize(20)
        .text('GROOAGRI', 50, 45)
        .fontSize(10)
        .text('Agri-Services & Equipment Rental', 50, 65)
        .fillColor('#000000')
        .fontSize(20)
        .text('INVOICE', 200, 50, { align: 'right' });

    doc.moveDown();
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();

    // --- Info Section ---
    const infoTop = 110;
    doc.fontSize(10)
        .font('Helvetica-Bold').text('Invoice Number:', 50, infoTop)
        .font('Helvetica').text(booking.bookingNumber, 150, infoTop)
        .font('Helvetica-Bold').text('Invoice Date:', 50, infoTop + 15)
        .font('Helvetica').text(new Date(bill.generatedAt).toLocaleDateString(), 150, infoTop + 15)
        .font('Helvetica-Bold').text('Booking Status:', 50, infoTop + 30)
        .font('Helvetica').text(booking.status.toUpperCase(), 150, infoTop + 30);

    doc.font('Helvetica-Bold').text('Bill To:', 350, infoTop)
        .font('Helvetica').text(booking.userId?.name || 'Valued Farmer', 350, infoTop + 15)
        .text(booking.userId?.phone || '', 350, infoTop + 30)
        .text(booking.address?.addressLine1 || '', 350, infoTop + 45, { width: 200 });

    // --- Agri Specific Details ---
    if (booking.serviceCategory === 'Agriculture' || booking.categoryId?.title === 'Agriculture' || booking.cropType || booking.landSize) {
        let agriTop = infoTop + 65;
        if (booking.cropType) {
            doc.font('Helvetica-Bold').fontSize(9).text('Crop Type:', 50, agriTop)
                .font('Helvetica').text(booking.cropType, 110, agriTop);
            agriTop += 12;
        }
        if (booking.landSize) {
            doc.font('Helvetica-Bold').fontSize(9).text('Land Area:', 50, agriTop)
                .font('Helvetica').text(booking.landSize, 110, agriTop);
        }
    }

    doc.moveDown(4);

    // --- Table Header ---
    const tableTop = 200;
    doc.font('Helvetica-Bold')
        .text('Description', 50, tableTop)
        .text('Qty', 280, tableTop)
        .text('Rate', 330, tableTop)
        .text('GST %', 400, tableTop)
        .text('Amount', 480, tableTop, { align: 'right' });

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 30;

    // --- Services ---
    bill.services.forEach(item => {
        doc.font('Helvetica').fontSize(9)
            .text(item.name, 50, y, { width: 220 })
            .text(item.quantity, 280, y)
            .text(`₹${item.price}`, 330, y)
            .text(`${item.gstPercentage}%`, 400, y)
            .text(`₹${item.total}`, 480, y, { align: 'right' });
        y += 20;
    });

    // --- Parts ---
    bill.parts.forEach(item => {
        doc.text(item.name, 50, y, { width: 220 })
            .text(item.quantity, 280, y)
            .text(`₹${item.price}`, 330, y)
            .text(`${item.gstPercentage}%`, 400, y)
            .text(`₹${item.total}`, 480, y, { align: 'right' });
        y += 20;
    });

    // --- Custom Items ---
    bill.customItems.forEach(item => {
        doc.text(item.name, 50, y, { width: 220 })
            .text(item.quantity, 280, y)
            .text(`₹${item.price}`, 330, y)
            .text(`${item.gstPercentage}%`, 400, y)
            .text(`₹${item.total}`, 480, y, { align: 'right' });
        y += 20;
    });

    // --- Transport/Visiting ---
    if (bill.visitingCharges > 0) {
        doc.text('Visiting/Service Charges', 50, y)
            .text('1', 280, y)
            .text(`₹${bill.visitingCharges}`, 330, y)
            .text('0%', 400, y)
            .text(`₹${bill.visitingCharges}`, 480, y, { align: 'right' });
        y += 20;
    }

    if (bill.transportCharges > 0) {
        doc.text('Transport Charges', 50, y)
            .text('1', 280, y)
            .text(`₹${bill.transportCharges}`, 330, y)
            .text('0%', 400, y)
            .text(`₹${bill.transportCharges}`, 480, y, { align: 'right' });
        y += 20;
    }

    // --- Totals ---
    const subtotalOver = y + 20;
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(350, subtotalOver).lineTo(550, subtotalOver).stroke();

    doc.font('Helvetica-Bold').fontSize(10)
        .text('Subtotal:', 350, subtotalOver + 15)
        .font('Helvetica').text(`₹${(bill.totalServiceBase + bill.totalPartsBase + bill.visitingCharges + bill.transportCharges).toFixed(2)}`, 480, subtotalOver + 15, { align: 'right' })

        .font('Helvetica-Bold').text('Total GST:', 350, subtotalOver + 30)
        .font('Helvetica').text(`₹${bill.totalGST.toFixed(2)}`, 480, subtotalOver + 30, { align: 'right' })

        .fontSize(12)
        .font('Helvetica-Bold').text('Grand Total:', 350, subtotalOver + 50)
        .fillColor('#00a6a6')
        .text(`₹${bill.grandTotal.toFixed(2)}`, 480, subtotalOver + 50, { align: 'right' });

    // --- Footer ---
    doc.fillColor('#888888')
        .fontSize(8)
        .text('This is a computer generated invoice and does not require a physical signature.', 50, 700, { align: 'center', width: 500 })
        .text('Thank you for choosing GrooAgri for your farming needs!', 50, 715, { align: 'center', width: 500 });

    doc.end();
};

module.exports = { generateInvoicePDF };
