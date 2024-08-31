const mongoose = require('mongoose');

const db = process.env.DB;


mongoose.connect(db).then(()=>{
    console.log('Database Connected')
   });

