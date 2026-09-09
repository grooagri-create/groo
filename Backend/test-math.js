const quantity = 1;
const product = { price: 1000, commissionPercentage: 10, gstPercentage: 5 };

console.log('=== Ecommerce Payment Logic Verification ===');

// The internal mathematical state generated from Backend Order placement
const itemsTotal = product.price * quantity;
const adminCommission = (itemsTotal * (product.commissionPercentage / 100));
const gstAmount = (itemsTotal * (product.gstPercentage / 100)); 
const platformFee = adminCommission + gstAmount;
const vendorBalance = itemsTotal - adminCommission;
const orderTotal = itemsTotal + gstAmount;

// End User Reality
const userPaysPlatform = platformFee; // Upfront payment via App
const userPaysVendor = vendorBalance; // Payment on delivery to Vendor
const totalUserWalletDeduct = userPaysPlatform + userPaysVendor;

console.log(`Product Price: ₹${product.price}, Qty: ${quantity}, GST: ${product.gstPercentage}%, Platform Comm: ${product.commissionPercentage}%`);
console.log(`- Items Subtotal: ₹${itemsTotal}`);
console.log(`- GST Amount: ₹${gstAmount}`);
console.log(`- Platform Fee (Platform keeps this: Comm + GST): ₹${platformFee}`);
console.log(`- Vendor Balance (Vendor keeps this: Total - Comm): ₹${vendorBalance}`);
console.log(`-----------------------------------------------`);
console.log(`NEW MATH FIX (Backend + Frontend Sync): `);
console.log(`Grand Total Displayed to User in UI: ₹${orderTotal}`);
console.log(`Actual physical cash User Pays out of pocket: ₹${totalUserWalletDeduct}`);
console.log(`Are these perfectly matched/equal now? : ${totalUserWalletDeduct === orderTotal ? 'YES - BUG COMPLETELY SOLVED!' : 'NO - BUG STILL EXISTS!'}`);
