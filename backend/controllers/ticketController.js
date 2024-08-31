const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const StatusColumn = require('../models/StatusColumnModel');
const History = require('../models/historyModel');




//Create a Ticket 
exports.CreateTicket = asyncerrorhandler(async(req,res,next)=>{
    const {
        title, 
        description,
        status,
        labels,
        attachments, 
        assignedby,
        assignedTo,
        projectID,
        type,
        parent,
        children
    }=req.body;
 

    if(title && projectID && type){
        
        
        const CheckPermission = await User.findById(assignedby);
        
 //Checking if assignedBy is a User with access or Admin
       if((CheckPermission && CheckPermission.AccessProvided) || (CheckPermission && CheckPermission.Role==='admin')){
        
        const projectExists = await Project.findById(projectID);
        
        if(projectExists){
            const projectName = projectExists.ProjectName;
            const prefix = projectName.split(' ').map(word => word[0]).join('').toUpperCase(); // Extract initials
            const latestTicketNumberEntry = await Ticket.findOne({ProjectId:projectID}).sort({ createdAt: -1 });
            let NewticketNumber;
            if(latestTicketNumberEntry){
                NewticketNumber = latestTicketNumberEntry.ticketNumber + 1;
            } else{
                NewticketNumber = 1; 
            }  
               
           
            if(projectID && NewticketNumber>0){
            const newTicketName = `${prefix}-${NewticketNumber}`;  
            let TicketData ={}
            
            TicketData = {
                title,
                description:description?description:'',
                labels:labels?labels:[''],
                attachments:attachments?attachments:'', 
                assignedby:assignedby?assignedby:'',
                ticketName:newTicketName,
                ticketNumber:NewticketNumber,
                ProjectId:projectID,
                children:[],
                type
            }

            if(assignedTo && assignedTo!==''){
                TicketData.assignedTo=assignedTo
            }

            if(status!==''){
               const StatusExists = await StatusColumn.findById(status);
               if(StatusExists){
                TicketData.status=status
               }
            }
        
              let parentID;
            //Checking Parent Ticket Availability
            if(parent){
                const  checkParent = await Ticket.findById(parent);
                if(checkParent && (type!=='epic' && checkParent.type === 'epic') || (type!=='epic' && type!=='story' && checkParent.type==='story') || 
                (type!=='epic' && type!=='story' && type!=='task' && (checkParent.type==='task'))
            ){
                    TicketData.parent = parent;
                    parentID=checkParent._id;
                }
            }
             
            let childernID=[];
            //Checking Children Ticket availability
            if(children && children.length >0){
                await Promise.all(children.map(async (child) => {
                    const checkchildrenTicket = await Ticket.findById(child);
                    if (checkchildrenTicket && (type!=='task' && type!=='subTask' && checkchildrenTicket.type === 'task') || (type!=='subTask' && checkchildrenTicket.type === 'subTask') || (type==='epic' && checkchildrenTicket.type==='story')) {
                       if(TicketData.children.length>0){
                        TicketData.children = [...TicketData.children, child]; 
                       }else{
                        TicketData.children = [child];  
                       }
                          childernID.push(checkchildrenTicket._id)
                        }
                
                }));
            }
    
            const NewTicket =  await Ticket.create((TicketData));

if(NewTicket){
                 //store in history the new ticket created action
                 await History.create({
                    eventName: ``,
                    eventItemType: 'ticket',
                    eventItemId: NewTicket._id,
                    action: 'Creation',
                    performedBy: CheckPermission._id,
                    changes:{
                        oldValue:{},
                        newValue:NewTicket
                    }
                });
            } 




            //Updating The Parent Tickets with new Childrens ID
            if(parentID && NewTicket){
                const Parent =  await Ticket.findById(parentID).populate({path:"children"});
                const oldValue = Parent && 'Ticket Added as Children';
             const UpdatedParentTicket =  await Ticket.findByIdAndUpdate(parentID , {$push : {"children" : NewTicket._id}},{new:true});
              if(!UpdatedParentTicket){
                return next({message:"Error Updating Parent Ticket",statusCode:500});
              }else{


                
                await History.create({
                    eventName:``,
                    action:`Updated`,
                    eventItemId:UpdatedParentTicket._id,
                    performedBy:CheckPermission._id,
                    updatedField:'children',
                    eventItemType:'ticket',
                    changes:{
                        oldValue:{
                            children:oldValue
                        },
                        newValue:{
                            children:NewTicket.ticketName
                        }
                    }
                })

                await History.create({
                    eventName:``,
                    action:`Updated`,
                    eventItemId:NewTicket._id,
                    performedBy:CheckPermission._id,
                    updatedField:'parent',
                    eventItemType:'ticket',
                    changes:{
                        oldValue:{
                            parent:'Ticket Added as a Parent'
                        },
                        newValue:{
                            parent:NewTicket.ticketName
                        }
                    }
                })

              }
            }

            // Updating each child ticket with the parent ID
             if(childernID.length > 0) {
            await Promise.all(childernID.map(async (childID) => {
             const updatedChildTicket = await Ticket.findByIdAndUpdate(childID, { parent: NewTicket._id }, { new: true });
             if(!updatedChildTicket) {
            return next({ message: "Error Updating Child Ticket", statusCode: 500 });
               }
              }));
            }

              

             res.status(200).json({success:true,message:"Ticket Created",NewTicket});
               
        }else{
            //error if No Ticket Number
            return next({message:'Server Error Please Try later',statusCode:405});     
        }   
        
        }

        
    }else{
        //error if Access Not provided
        return next({message:'Unauthorized,Access Denied',statusCode:403});
    }

       
    }else{
        //Error if Title and projectName is Not Provided               
    return next({message:'UnAuthorized,Please Provide Necessary Fields',statusCode:403});
    }
 });

 //Update A Ticket Based
 exports.UpdateTicket = asyncerrorhandler(async(req,res,next)=>{
  const  {id} = req.body;
  const user = req.user;
  const { 
    title, 
    description,
    status,
    labels,
    attachments, 
    assignedTo,
    assignedby,
    type,
    //can we update Project Name?
    parent,
    children,
    childrenIdRemoved,
    removeParent,
    estimatedTime,
    loggedTime,
    Bin
   } = req.body;

  if(id && user){
    //Checking if Ticket Exists
    const TicketToUpdate = await Ticket.findById(id);
    if(TicketToUpdate){
        //Checking if atleast one of these is changed
    if(title  || description==='' || description || estimatedTime || loggedTime || status || labels || attachments || assignedTo || assignedby || type || parent || children || childrenIdRemoved ||removeParent || Bin){
       
        const UpdateTicketData = { }
        const Oldvalues = {}
        let UpdatedField = '';

        if(title && title!=='' && title!==TicketToUpdate.title){
            UpdateTicketData.title=title;
            UpdatedField='title';
            Oldvalues.title=TicketToUpdate.title
        }

        if(type && type!==TicketToUpdate.type && TicketToUpdate.type!=='epic'){
            UpdateTicketData.type=type;
            UpdatedField='type';
            Oldvalues.type=TicketToUpdate.type
        }

        if(estimatedTime && estimatedTime!==TicketToUpdate.estimatedTime){
            UpdateTicketData.estimatedTime = estimatedTime;
            UpdatedField='estimated Time';
            Oldvalues.estimatedTime = TicketToUpdate.estimatedTime?TicketToUpdate.estimatedTime:'';
        }

        
        if(loggedTime && loggedTime!==TicketToUpdate.loggedTime){
            UpdateTicketData.loggedTime = loggedTime;
            UpdatedField='Actual Time';
            Oldvalues.loggedTime = TicketToUpdate.loggedTime?TicketToUpdate.loggedTime:'';
        }

        if(labels){
            UpdateTicketData.labels=[...TicketToUpdate.labels,...labels];
            UpdatedField='labels';
            Oldvalues.labels=TicketToUpdate.labels
        }

        if(attachments!=='' && attachments){
            UpdateTicketData.attachments=attachments;
            UpdatedField='attachments';
            Oldvalues.attachments=TicketToUpdate.attachments
        }

        let assignedToField;
        if(assignedTo!=='' && assignedTo!==TicketToUpdate.assignedTo){
            const UserExists = await User.findById(assignedTo);
            if(UserExists){
                assignedToField=`${UserExists.FirstName} ${UserExists.LastName}`
            UpdateTicketData.assignedTo=assignedTo;
            UpdatedField='assignedTo';
            if(TicketToUpdate.assignedTo){
            const oldAssignedTo = await User.findById(TicketToUpdate.assignedTo)
            Oldvalues.assignedTo=`${oldAssignedTo.FirstName} ${oldAssignedTo.LastName}`
            
        }else{
            Oldvalues.assignedTo=''
        }
    }
        }

        let assignedbyField;
        if(assignedby!=='' && assignedby!==TicketToUpdate.assignedby){
            const UserExists = await User.findById(assignedby);
            if(UserExists){
                assignedbyField=`${UserExists.FirstName} ${UserExists.LastName}`;
            UpdateTicketData.assignedby=assignedby;
            UpdatedField='assignedby';
            if(TicketToUpdate.assignedby){
            const oldassignedby = await User.findById(TicketToUpdate.assignedby)
            Oldvalues.assignedby=`${oldassignedby.FirstName} ${oldassignedby.LastName}`
        }else{
            Oldvalues.assignedby=''
        }
    }
        }

        if(description!==undefined  && description!==TicketToUpdate.description){
            UpdateTicketData.description=description
            UpdatedField='description';
            Oldvalues.description=TicketToUpdate.description
        }

        let newStatusName;
        if(status!=='' && status && status!==TicketToUpdate.status){
           // console.log('different status');
            const StatusExists = await StatusColumn.findById(status);
            if(StatusExists){
                UpdateTicketData.status=status
                UpdatedField='status';
                const oldStatus = await StatusColumn.findById(TicketToUpdate.status);
                if(oldStatus){
                Oldvalues.status=oldStatus.StatusName
                }
                newStatusName = StatusExists.StatusName;
            }
         }
         
         let action = 'Updated';
        if(Bin){
            if(TicketToUpdate.deleted){
                UpdateTicketData.deleted=false
               // Oldvalues.deleted = true
                DeleteStatus=false
                action= "Restored" 
            }else{
                UpdateTicketData.deleted=true
               // Oldvalues.deleted=false
                DeleteStatus=true
                action= "Deleted"  
            }
        }

        let parentID;
        let parentTicketName;
         //Checking Parent Ticket Availability
         if(parent){
            if(TicketToUpdate.parent!==parent || !TicketToUpdate.parent){
                const  checkParent = await Ticket.findById(parent);
                if(checkParent){
                   // console.log(checkParent,'Checkparent');
                    if(checkParent && (TicketToUpdate.type!=='epic' && checkParent.type === 'epic') || (TicketToUpdate.type!=='epic' && TicketToUpdate.type!=='story' && checkParent.type==='story') || 
                    (TicketToUpdate.type!=='epic' && TicketToUpdate.type!=='story' && TicketToUpdate.type!=='task' && (checkParent.type==='task'))
                ){
                    UpdateTicketData.parent = parent
                    UpdatedField='parent';
                    if(TicketToUpdate.parent){
                        const ticketParent = await Ticket.findById(TicketToUpdate.parent);
                        if(ticketParent){
                    Oldvalues.parent=ticketParent.ticketName;
                        }    
                }else{
                        Oldvalues.parent=""     
                    }
                }else{
                    UpdateTicketData.parent = TicketToUpdate.parent && TicketToUpdate.parent   
                     
                }
                parentID = checkParent._id;
                parentTicketName= checkParent.ticketName;
            }
            }
         }
          

        let  childernID = [] 
        let  childrensTicketName;
        //Checking Children Ticket availability
        if(children && children.length>0){
            const  checkchildrenTicket = await Ticket.findById(children);
            if(checkchildrenTicket &&  checkchildrenTicket.type === 'task' || checkchildrenTicket.type==='subTask'){
                //Check if childern Already Exist in the ChildrenIDs array of the updating ticket
                const ChildrenExist = TicketToUpdate.children.includes(children);
                if(!ChildrenExist){
                UpdateTicketData.children = [...TicketToUpdate.children,children]
                UpdatedField='children';
                Oldvalues.children= 'Ticket Added To Children';
                childrensTicketName=checkchildrenTicket.ticketName
            }else{
                UpdateTicketData.children = [...TicketToUpdate.children]
            }
            childernID.push(checkchildrenTicket._id)
            }
        }


        //Checking Removed ChildrenId 
        if(childrenIdRemoved){
            UpdatedField='children';
            const RemoveTicket = await Ticket.findById(childrenIdRemoved);
               if(TicketToUpdate && RemoveTicket){
                const CheckIdExist = TicketToUpdate.children.includes(childrenIdRemoved);
                if(CheckIdExist){
                    const NewChildrenIds = TicketToUpdate.children.filter((children)=>children.toString()!==childrenIdRemoved);
                    UpdateTicketData.children = NewChildrenIds;
                    Oldvalues.children='Ticket Removed From Children';
                    childrensTicketName = RemoveTicket.ticketName;
                }  
            }
        }

         //if parent is removed updating parent ticket to remove current ticket as child
        let parentRemoved;
         if(removeParent){
            UpdatedField='parent';
            const  parentTicket = await Ticket.findById(TicketToUpdate.parent);
            Oldvalues.parent = 'Ticket Removed as Parent';
            parentRemoved = parentTicket.ticketName;
            if(parentTicket){
                const FilterdChildrenTickets =  parentTicket.children.filter((item)=>{
                 return item.toString()!==TicketToUpdate._id.toString()
             })
             if(FilterdChildrenTickets){
                // console.log(parentTicket.children,'Notfiltered');
                // console.log(FilterdChildrenTickets,'filtered');
              await  parentTicket.updateOne({children:FilterdChildrenTickets})

            //store in history the Children Added in Parent Ticket 
            await History.create({
                eventName: ``,
                eventItemType: 'ticket',
                eventItemId: parentTicket._id,
                action: action,
                performedBy: user._id,
                changes:{
                    oldValue:{children:'Ticket Removed as Children'},
                    newValue:{children:TicketToUpdate.ticketName}
                }
            });
    
             }
            }
           }

       
        const  UpdatedTicket = await Ticket.findOneAndUpdate(
            {_id:id},
            {
            $set: UpdateTicketData,
            $unset:removeParent?{'parent':1}:{}
         },
         {new:true}
         );

    if(UpdatedTicket){

          

           //Updating The Parent Tickets with new Childrens ID && Removing Current Ticket as children from old parent ticket
           if(parentID){
            const NewParentTicket = await Ticket.findById(parentID);
            if(NewParentTicket){
            const UpdatedParentTicket =  await Ticket.findByIdAndUpdate(parentID , {$push : {"children" : UpdatedTicket._id}},{new:true});
             if(!UpdatedParentTicket){
               return next({message:"Error Updating Parent Ticket",statusCode:500});
             }

             //store in history the Children Added in Parent Ticket 
             await History.create({
            eventName: ``,
            eventItemType: 'ticket',
            eventItemId: UpdatedParentTicket._id,
            action: action,
            performedBy: user._id,
            changes:{
                oldValue:{children:'Ticket Added as Children'},
                newValue:{children:UpdatedTicket.ticketName}
            }
        });
              }


               //Removing children ticket from old parent ticket 
            const OldParentTicket = await Ticket.findById(TicketToUpdate.parent);
            if(OldParentTicket){
                const FilteredChildrenTickets = OldParentTicket.children.filter((id)=>id.toString()!==TicketToUpdate._id.toString()); 
                const UpdateOldParentTicket = await Ticket.findByIdAndUpdate(TicketToUpdate.parent,{
                    children:FilteredChildrenTickets
                },{new:true})
                if(!UpdateOldParentTicket){
                    return next({message:"Error Updating Parent Ticket",statusCode:500});
                  }else{
           
                  //store in history the Children Removed in old Parent Ticket 
               await History.create({
                eventName: ``,
                eventItemType: 'ticket',
                eventItemId: UpdateOldParentTicket._id,
                action: action,
                performedBy: user._id,
                changes:{
                    oldValue:{children:'Ticket Removed as Children'},
                    newValue:{children:TicketToUpdate.ticketName}
                }
            });
        }
                }
           }

   
           // Updating each child ticket with the parent ID
            if(childernID.length > 0) {
           await Promise.all(childernID.map(async (childID) => {
            const ChildrenTicket = await Ticket.findById(childID);
            if(ChildrenTicket){
            const updatedChildTicket = await Ticket.findByIdAndUpdate(childID, { parent: UpdatedTicket._id }, { new: true });
            if(!updatedChildTicket) {
           return next({ message: "Error Updating Child Ticket", statusCode: 500 });
              }

            //   console.log('new Childrens ticket parent updating');
                  //store in history the Parent Added in Children Tickets 
             await History.create({
                eventName: ``,
                eventItemType: 'ticket',
                eventItemId: updatedChildTicket._id,
                action: 'Creation',
                performedBy: user._id,
                changes:{
                    oldValue:{parent:ChildrenTicket.parent},
                    newValue:{parent:updatedChildTicket.parent}
                }
            });
           // console.log('new Childrens ticket updated');
             }
           }
            ));
             
           }

           //if child removed updating child ticket to remove the current ticket as parent
           if(childrenIdRemoved){
            const childernTicket = await Ticket.findById(childrenIdRemoved);
            if(childernTicket){
                const ParentRemoved = await Ticket.findById(childernTicket.parent);
                await childernTicket.updateOne({
                    $unset:{'parent':1}
                });

              
                       //store in history the Parent Removed in Children Ticket 
             await History.create({
                eventName: ``,
                eventItemType: 'ticket',
                eventItemId: childernTicket._id,
                action: 'Removal',
                performedBy: user._id,
                changes:{
                    oldValue:{parent:'Removed parent Ticket'},
                    newValue:{parent:ParentRemoved.ticketName}
                }
            });
            }
           }

          
           function checkSameObjects(obj1, obj2) {
            // Check if either object is undefined or an empty object
            if (!obj1 || !obj2 || Object.keys(obj1).length === 0 || Object.keys(obj2).length === 0) {
              return false;
            }
          
            // Extract the key-value pair from each object
            const key1 = Object.keys(obj1)[0];
            const key2 = Object.keys(obj2)[0];
            const value1 = obj1[key1];
            const value2 = obj2[key2];
          
            // Check if the keys and values are the same
            return key1 === key2 && value1 === value2;
          }
          

         // console.log(UpdatedField,'field here 1');
           if(!checkSameObjects(Oldvalues,UpdateTicketData)){
           // console.log(UpdatedField,'field here');
              //store in history the new ticket Updated action
            await History.create({
            eventName: ``,
            eventItemType: 'ticket',
            eventItemId: UpdatedTicket._id,
            action: action,
            performedBy: user._id,
            updatedField:UpdatedField,
            changes:{
                oldValue:Oldvalues,
                newValue:action==='Restored' || action==='Deleted'?{}:parentRemoved?{parent:parentRemoved}:newStatusName?{status:newStatusName}:
                         childrensTicketName?{children:childrensTicketName}:
                         parentTicketName?{parent:parentTicketName}:
                         assignedToField?{assignedTo:assignedToField}:
                         assignedbyField?{assignedby:assignedbyField}:
                         UpdateTicketData
            }
        });
    }
        //console.log(UpdateTicketData);
        res.status(200).json({success:true,message:"Ticket Updated",UpdatedTicket}); 
     
    }else{
        return next({message:'Server Error, Ticket Not Updated Pls Try later',statusCode:500});      
    }
}else{
    return next({message:'Please provide Atleast One Field To Update',statusCode:403});      
}
}
   }else{
    return next({message:'UnAuthorized,Please Provide Ticket ID',statusCode:403});
   }
 });



 //Get All Tickets
 exports.GetAllTickets = asyncerrorhandler(async(req,res,next)=>{

const {projectID,status,type,labels,assignedby,assignedTo,projectName,ticketNumber,Bin,search} = req.body;

if(projectID){
 
    const ProjectExists = await Project.findById(projectID); 

    if(ProjectExists){

    const query = {
        ProjectId: projectID
    }

    if(status){
        query.status = status
    }
    if(type){
        query.type = type
    }
    if(labels){
        query.labels = labels
    }
    if(assignedby){
        query.assignedby = assignedby
    }
    if(assignedTo){
        query.assignedTo = assignedTo
    }
    if(projectName){
        query.projectName = projectName
    }
    if(ticketNumber){
        query.ticketNumber = ticketNumber
    }
    
    if(search) {
       // Split the search term by spaces
    const searchTerms = search.split(/\s+/);

    // Construct the regex search with each search term
    const regexSearch = searchTerms.map(term => `(?=.*${term})`).join('');

    const regex = new RegExp(regexSearch, 'i');
    const NotaNumber = isNaN(search);
 
    if(NotaNumber){
    query.$or = [
        { title: { $regex: regex } },
    ];
}else{
    query.$or = [
        { ticketNumber: search },
    ];
}
    }
 

    
    if(Bin){
        query.deleted = true
    }else{
        query.deleted = false
    }

    // console.log(query,'used');
    const tickets = await Ticket.find(query).populate([
        {
        path:'assignedby',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
       {
        path:'assignedTo',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
       {
        path:'status',
        select:'StatusName' 
       },
       {
        path:'ProjectId',
        select:'ProjectName'
       },
       {
        path:'parent',
        select:'title type ProjectId description status ticketName ticketNumber'
       }
    ]);
    if(tickets){       
        res.status(200).json({success:true,tickets});
    }else{
        return next({message:'No Tickets Found',statusCode:404});
    }
    
   }
}else{
    return next({message:'UnAuthorized,Please Provide Project ID',statusCode:403});
 }
 });


 //Get Parent/Children Tickets available  for a given ticketID
 exports.GetParenTickets = asyncerrorhandler(async(req,res,next)=>{
    const {projectId,Relation,SelectedType,TicketId,Search,searchEnabled} = req.body;
    if(projectId){
        if(Relation && SelectedType && TicketId){

        const ProjectExists = await Project.findById(projectId); 
    
        if(ProjectExists){
    


        const query = { }

        if(TicketId){
            const TicketExists = await Ticket.findById(TicketId);
            if(TicketExists){
                query._id={$ne:TicketExists._id}
            }
        }

        
        if(Relation==='parent' && SelectedType){
            if(SelectedType!=='epic'){
            query.ProjectId=projectId;
       
            if(SelectedType==='story'){
                query.type='epic';
            }else
            if(SelectedType==='task'){
                query.type={$in:['epic','story']}       
            }else 
            if(SelectedType==='subTask'){
            query.type={$in:['epic','story','task']}       
            }
        }
    }else if(Relation==='children' && SelectedType){
            query.ProjectId=projectId;
            query.parent = { $exists: false };
            if(Search && searchEnabled) {
                query.title = { $regex: Search, $options: 'i' }; // Case-insensitive search
             }
            if(SelectedType==='epic'){
                query.type={$in:['task','subTask','story']}       
            }else if(SelectedType==='story'){
                query.type={$in:['task','subTask']}       
            }else if(SelectedType==='task'){
                query.type='subTask'        
            }
    }

  
         if(query.ProjectId){
            if(!searchEnabled || (searchEnabled && Search!=='') && SelectedType!=='subTask' ){
        const Relationtickets = await Ticket.find(query).populate([
            {
            path:'assignedby',
            select:'FirstName LastName Email Role Approved AccessProvided'
           },
           {
            path:'assignedTo',
            select:'FirstName LastName Email Role Approved AccessProvided'
           }
        ]);

        if(Relationtickets){
              res.status(200).json(Relationtickets);
        }else{
            return next({message:'No Ticket Found,Please  Check Project ID',statusCode:404});   
        }
    }else{
        res.status(200).json([]);      
    }
    }
    }
}else{
    return next({message:'Please provide All Required Fields',statusCode:404});   
}
  }else{
    return next({message:'No Project ID Found',statusCode:404});   
  }

 })


//Get A Specific Ticket
exports.GetSpecificTicket = asyncerrorhandler(async(req,res,next)=>{
 const {id,ProjectId} = req.body;
 if(id && ProjectId){
    //console.log('started backend specific ticket fetch')
  const SpecificTicket = await Ticket.findOne({_id:id,ProjectId:ProjectId}).populate([ 
      {
        path:'assignedby',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
       {
        path:'assignedTo',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
       {
        path:'ProjectId',
        select:'_id ProjectName'
       },
       {
        path:'status',
        select:'_id StatusName'
       },
       {
        path:'parent',
        select:'title type ProjectId description status ticketName ticketNumber'
       },
       {
        path:'children',
        select:'title type ProjectId description status ticketName ticketNumber'
       }
]);

  if (SpecificTicket) {
   // console.log('sent backend specific ticket fetch')
    res.status(200).json({success:true,SpecificTicket});  
}else{
    //console.log('failed backend specific ticket fetch')
    return next({message:'No Ticket Found,Please  Check Ticket/Project ID',statusCode:404});   
  }

 }else{
    //console.log('no id')
    return next({message:'UnAuthorized,Please Provide Ticket And ProjectId ID',statusCode:403});
 }
});






