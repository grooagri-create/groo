const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://grooagri_db_user:grooagri_db_user@cluster0.zbhhozr.mongodb.net/groo')
  .then(async () => {
    const Category = require('./models/Category');
    const Service = require('./models/Service');
    const cats = await Category.find();
    console.log("=== Categories ===");
    cats.forEach(c => console.log('Category:', c.title, 'SubServices:', c.subServices));
    
    const srvs = await Service.find();
    console.log("=== Services ===");
    srvs.forEach(c => console.log('Service:', c.name, 'SubServices:', c.subServices));
    
    process.exit(0);
  });
