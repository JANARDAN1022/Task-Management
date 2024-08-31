const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
 const Project = require('../models/projectModel');
// const User = require('../models/userModel');
const Status = require('../models/StatusColumnModel');
const History = require('../models/historyModel');
const Ticket = require('../models/ticketModel');





 //Get Specific Ticket History 
 exports.GetSpecificTickethistory = asyncerrorhandler(async(req,res,next)=>{
    const {ticketId,page,updatedField,performedBy} = req.body;
    let pageSize = 10;
    if(ticketId){
 
        const TicketExists = await Ticket.findById(ticketId); 
    
        if(TicketExists){
  
          let pageNumber = page || 1; // Default to page 1 if not provided
          const skipCount =  (pageNumber - 1) * pageSize;
          const query = {
            eventItemId:TicketExists._id
          }
          if(updatedField){
            query.updatedField=updatedField
          }
          if(performedBy){
            query.performedBy = performedBy;
          }
     
        const TicketHistory = await History.find(query).populate([
            {
            path:'performedBy',
            select:'FirstName LastName Email Role Approved AccessProvided'
           },
           {path:'eventItemId'}
        ]).sort({ createdAt: -1 })
        .skip(skipCount)
        .limit(pageSize);

        const totalCount = await History.countDocuments(query); // Counting total number of documents


      res.status(200).json({
        TicketHistory,
        hasNextPage: (skipCount + TicketHistory.length) < totalCount
      });
    }else{
        return next({message:'No Ticket Found,Please Check Ticket ID',statusCode:404});          
    }
  }else{
    return next({message:'Please provide Ticket ID',statusCode:403});   
  }

 })

 
 //Get Specific Project History 
 exports.GetSpecificProjectHistory = asyncerrorhandler(async(req,res,next)=>{
    const {projectId} = req.body;
  
    if(projectId){
 
        const ProjectExists = await Project.findById(projectId); 
    
        if(ProjectExists){
  
        const ProjectHistory = await History.find({eventItemId:ProjectExists._id}).populate([
            {
            path:'performedBy',
            select:'FirstName LastName Email Role Approved AccessProvided'
           },
           {path:'eventItemId'}
        ]);

      res.status(200).json(ProjectHistory);
    }else{
        return next({message:'No Project Found,Please Check Project ID',statusCode:404});          
    }
  }else{
    return next({message:'Please provide Project ID',statusCode:403});   
  }

 })


 //Get Specific Column History 
 exports.GetSpecificColumnHistory = asyncerrorhandler(async(req,res,next)=>{
  const {columnId} = req.body;

  if(columnId){

      const columnExists = await Status.findById(columnId); 
  
      if(columnExists){

      const columnHistory = await History.find({eventItemId:columnExists._id}).populate([
          {
          path:'performedBy',
          select:'FirstName LastName Email Role Approved AccessProvided'
         },
         {path:'eventItemId'}
      ]);

    res.status(200).json(columnHistory);
  }else{
      return next({message:'No Column Found,Please Check Column ID',statusCode:404});          
  }
}else{
  return next({message:'Please provide column ID',statusCode:403});   
}

})



// Get Complete Project History
exports.GetCompleteProjectHistory = asyncerrorhandler(async (req, res, next) => {
  const { projectId, page, updatedField, performedBy } = req.body;
  let pageSize = 10;
  let pageNumber = page || 1; 
  const skipCount = (pageNumber - 1) * pageSize;

  if (!projectId) {
      return next({ message: 'Please provide Project ID', statusCode: 403 });
  }

  const ProjectExists = await Project.findById(projectId);
  if (!ProjectExists) {
      return next({ message: 'No Project Found, Please Check Project ID', statusCode: 404 });
  }

  const projectHistoryQuery = {
      eventItemId: ProjectExists._id
  };

  const tickets = await Ticket.find({ projectId: projectId });

  const columns = await Status.find({ projectId: projectId });

  const ticketIds = tickets.map(ticket => ticket._id);
  const columnIds = columns.map(column => column._id);

  const combinedQuery = {
      $or: [
          { eventItemId: ProjectExists._id },
          { eventItemId: { $in: ticketIds } },
          { eventItemId: { $in: columnIds } }
      ]
  };

  if (updatedField) {
      combinedQuery.updatedField = updatedField;
  }
  if (performedBy) {
      combinedQuery.performedBy = performedBy;
  }

 
  const combinedHistory = await History.find(combinedQuery).populate([
      {
          path: 'performedBy',
          select: 'FirstName LastName Email Role Approved AccessProvided'
      },
      { path: 'eventItemId' }
  ])
  .sort({ createdAt: -1 })
  .skip(skipCount)
  .limit(pageSize);

  const totalCount = await History.countDocuments(combinedQuery); // total docs

  res.status(200).json({
      combinedHistory,
      hasNextPage: (skipCount + combinedHistory.length) < totalCount
  });
});