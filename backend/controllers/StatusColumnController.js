const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
const StatusColumn = require('../models/StatusColumnModel');
const Project = require('../models/projectModel');
const Ticket = require('../models/ticketModel');
const History = require('../models/historyModel');



//Create New Status
exports.createStatus = asyncerrorhandler(async(req,res,next)=>{
 const user = req.user;
 if(user){
 const {StatusName,Description,ProjectId}  = req.body;

 if(StatusName && ProjectId){
   const ProjectExists = await Project.findById(ProjectId);
   if(ProjectExists){
    const StatusExists = await StatusColumn.find({StatusName:StatusName,ProjectId:ProjectId,Deleted:false});
    if(!StatusExists || StatusExists.length===0){
   const StatusData = {
    StatusName:StatusName.toUpperCase(),
    ProjectId,
    createdBy:user._id,
   }
   if(Description){
    StatusData.Description= Description;
   }

   const NewStatus = await StatusColumn.create(StatusData);
  
   if(NewStatus){

       //store in history the new column created action
        await History.create({
        eventName: `Column  ${NewStatus.StatusName}  Created by ${user.FirstName} ${user.LastName} in Project ${ProjectExists.ProjectName}`,
        eventItemType: 'StatusColumn',
        eventItemId: NewStatus._id,
        action: 'Creation',
        performedBy: user._id,
        changes:{
            oldValue:{},
            newValue:NewStatus
        }
    });



    res.status(200).json({success:true,NewStatus});
   }else{
    //if failed to create status
    return next({message:'Server Error Please try later',statusCode:500});   
   }
}else{
    //if status already exists
    // console.log(StatusExists,'exists here');
    return next({message:'Status Already Exists',statusCode:403});    
   }  
   }else{
    return next({message:'Project Does Not Exists, Provide A Valid ID',statusCode:403});     
   }
 }else{
    // if No StatusName Provided
    return next({message:'Please Provide Required Fields',statusCode:403});
 }
}else{
    //if No User
    return next({message:'Please Login First',statusCode:403});   
}
});



//Update a Specific Status
exports.UpdateStatus = asyncerrorhandler(async(req,res,next)=>{
const user = req.user;
const {StatusId} = req.body;
const {UpdatedStatusName,UpdatedStatusDescription,Deleted} = req.body;

if(user && StatusId){
    const StatusToUpdate = await StatusColumn.findById(StatusId);
    if(StatusToUpdate){
if(UpdatedStatusName || UpdatedStatusDescription || Deleted){

    const UpdateStatusData = {
        LastUpdatedBy:user._id
    };
    const oldValues = {
        LastUpdatedBy:StatusToUpdate.LastUpdatedBy
    };

    if(UpdatedStatusName && UpdatedStatusName!==StatusToUpdate.StatusName){
    UpdateStatusData.StatusName = UpdatedStatusName.toUpperCase();
    oldValues.StatusName = StatusToUpdate.StatusName;
    }
    if(UpdatedStatusDescription && UpdatedStatusDescription!==StatusToUpdate.Description){
        UpdateStatusData.Description = UpdatedStatusDescription
        oldValues.Description = StatusToUpdate.Description;
    }

    let action="Updated";

    if(Deleted){
        if(StatusToUpdate.Deleted){
        UpdateStatusData.Deleted = false
        oldValues.Deleted = true;
        action='Restored'
        }else{
            UpdateStatusData.Deleted = true
            oldValues.Deleted = false;
            action='Deleted'
        }
    }

    const UpdatedStatus = await StatusColumn.findOneAndUpdate(
        {_id:StatusId},
        {
            $set:UpdateStatusData,
        },
        {new:true}
    )


     if(UpdatedStatus){      

   //store in history the Column Update 
   await History.create({
    eventName: `${UpdatedStatus.StatusName} ${action} by ${user.FirstName} ${user.LastName}`,
    eventItemType: 'StatusColumn',
    eventItemId: UpdatedStatus._id,
    action: 'Update',
    performedBy: user._id,
    changes:{
        oldValue:oldValues,
        newValue:UpdateStatusData
    }
});

res.status(200).json({success:true,UpdatedStatus});
}else{
         //if failed to update status
    return next({message:'Server Error Please try later',statusCode:500});   
     }

}else{
    //if No Field Changed
    return next({message:'Please change Atleast one Field',statusCode:403});       
}
    }else{
    //if No Status Found For the Id 
    return next({message:'Please Provide a Correct Id',statusCode:403});       
    }
}else{
    //if No User or ID
    if(!user){
    return next({message:'Please Login First',statusCode:403});       
    }else if(!StatusId){
        return next({message:'Please provide Status Id',statusCode:403});            
    }
}
});



//Get All statuses 
exports.GetAllStatus = asyncerrorhandler(async(req,res,next)=>{
const {ProjectId,search,Deleted} = req.body;

const filter = {
    ProjectId
};

if(search) {
    // Split the search term by spaces
 const searchTerms = search.split(/\s+/);

 // Construct the regex search with each search term
 const regexSearch = searchTerms.map(term => `(?=.*${term})`).join('');

 const regex = new RegExp(regexSearch, 'i');


 filter.StatusName = { $regex: regex } 
 }

 if(Deleted){
    filter.Deleted = true
 }else{
    filter.Deleted = false
 }
 if(ProjectId){
   
 const AllStatus = await StatusColumn.find(filter).populate([
    {
    path:'createdBy',
    select:'FirstName LastName Email Role Approved AccessProvided'
   },
   {
    path:'LastUpdatedBy',
    select:'FirstName LastName Email Role Approved AccessProvided'
   }
]);

res.status(200).json({success:true,AllStatus});
 }else{
    return next({message:'Please provide project Id',statusCode:403});             
 }
});


//Delete Status Column
exports.DeleteStatusColumn = asyncerrorhandler(async(req,res,next)=>{
    const {statusID,moveStatusTo} = req.body;

    if(statusID && moveStatusTo){
        //Check if Status To be Deleted Exists
        const StatusExists = await StatusColumn.findById(statusID);
        if(StatusExists){
            //all Tickets inside The Status Column
            const TicketsToMove = await  Ticket.find({status: StatusExists._id,ProjectId:StatusExists.ProjectId });
           
           //updating tickets if any to have new moveTostatus 
            if(TicketsToMove.length>0){
                 //check if provided moveTo status exists in status column 
                const moveStatusToExists = await  StatusColumn.findOne({_id:moveStatusTo});
    
                   if(moveStatusToExists){
                    //mapping ticket ids with old status
                    const ticketIds = TicketsToMove.map(ticket => ticket._id);
                     
                    //updating the tickets to change the status
                    await Ticket.updateMany(
                        { _id: { $in: ticketIds } },
                        { $set: { status: moveStatusToExists._id } },
                      );
                    }else{
                        return next({message:'Please Provide A Valid Status, Status Does Not Exist',statusCode:404});                                     
                    }
                    }

            const  deletedStatus= await StatusColumn.findByIdAndUpdate({_id:statusID},{Deleted:true});
            if(deletedStatus){
                res.status(200).json({success:true,message:'Deleted Status Successfully'});
            }else{
                return next({message:'Please try later,server error',statusCode:500});                         
            }
        }else{
            return next({message:'Please provide a valid Status Id, status not found',statusCode:404});                 
        }

    }else{
        if(!statusID){
            return next({message:'Please provide Status Id',statusCode:403});             
        }
    }
})