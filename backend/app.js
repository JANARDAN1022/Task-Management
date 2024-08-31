const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const ErrorHandler = require('./middleWares/ErrorHandler');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const TicketRoutes = require('./routes/ticketRoutes');
const ProjectRoutes = require('./routes/projectRoutes');
const StatusColumnRoutes = require('./routes/StatusColumnRoutes');
const HistoryRoutes = require('./routes/historyRoutes');
const CompanyRoutes = require('./routes/companyRoutes');
const app = express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(cors({
    origin:['http://localhost:5173'], 
    credentials: true,
    exposedHeaders: 'Access-Control-Allow-Private-Network',
  }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/users/',userRoutes);
app.use('/api/tickets/',TicketRoutes);
app.use('/api/projects/',ProjectRoutes);
app.use('/api/statusColumn/',StatusColumnRoutes);
app.use('/api/history/',HistoryRoutes);
app.use('/api/company/',CompanyRoutes);
app.use(ErrorHandler);



app.get('/',(req,res)=>{
    res.json('Wroking, Hello From Internship-Tracker backend');
    });
  
module.exports = app;