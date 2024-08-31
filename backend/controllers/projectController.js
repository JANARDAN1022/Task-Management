const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const Status = require('../models/StatusColumnModel');
const History = require('../models/historyModel');


//Create New project
exports.CreateProject = asyncerrorhandler(async (req, res,next) => {

    const {id,Name,Description,EstimatedEndDate,StartDate,company} = req.body;
    
    if(id && Name && company){
        //Checking if User(Manager Role is checked by Middleware) or Admin exists
       const UserExists = await User.findById(id);
       

       if(UserExists){
        const ProjectExists = await Project.find({ProjectName:Name});
        if(ProjectExists.length===0){
            const newProjectData = {
                ProjectName:Name,
                company:company,
            Description:Description?Description:'',
            StartDate:StartDate?StartDate:new Date(),
            createdBy:id
            }

            if(EstimatedEndDate){
               newProjectData.EstimatedEndDate=EstimatedEndDate
            }

         const NewProject = await Project.create(newProjectData);
         if(NewProject){
         
         
            //store in history the new project created action
            const StoreProjectCreatedHistory =  await History.create({
                eventName: `Project ${NewProject.ProjectName}  Created by ${UserExists.FirstName} ${UserExists.LastName}`,
                eventItemType: 'project',
                eventItemId: NewProject._id,
                action: 'Creation',
                performedBy: UserExists._id,
                changes:{
                    oldValue:{},
                    newValue:NewProject
                }
            });

            //if Project is created , create default columns for that project
          const ToDOStatus = await Status.create({
            StatusName:"TO DO",
            ProjectId:NewProject._id,
            createdBy:id, 
          })
          const InProgressStatus = await Status.create({
            StatusName:"IN PROGRESS",
            ProjectId:NewProject._id,
            createdBy:id, 
          });
          const DoneStatus = await Status.create({
            StatusName:"DONE",
            ProjectId:NewProject._id,
            createdBy:id, 
          });
          
          if(StoreProjectCreatedHistory && ToDOStatus && DoneStatus && InProgressStatus){
            console.log(ToDOStatus,'status');
            //store in history the new todo columd for new project created action
            const StoreToDoHistory =  await History.create({
                eventName: `Column ${ToDOStatus.StatusName}  Created by ${UserExists.FirstName} ${UserExists.LastName}`,
                eventItemType: 'StatusColumn',
                eventItemId: ToDOStatus._id,
                action: 'Creation',
                performedBy: UserExists._id,
                changes:{
                    oldValue:{},
                    newValue:ToDOStatus
                }
            });

            
            //store in history the new inProgress column for new project created action
          const StoreInProgressHistory =  await History.create({
            eventName: `Column ${InProgressStatus.StatusName}  Created by ${UserExists.FirstName} ${UserExists.LastName}`,
            eventItemType: 'StatusColumn',
            eventItemId: InProgressStatus._id,
            action: 'Creation',
            performedBy: UserExists._id,
            changes:{
                oldValue:{},
                newValue:InProgressStatus
            }
        });

        
            //store in history the new Done Column created for new project created action
            const StoreDoneHistory =  await History.create({
                eventName: `Column ${DoneStatus.StatusName}  Created by ${UserExists.FirstName} ${UserExists.LastName}`,
                eventItemType: 'StatusColumn',
                eventItemId: DoneStatus._id,
                action: 'Creation',
                performedBy: UserExists._id,
                changes:{
                    oldValue:{},
                    newValue:DoneStatus
                }
            });
         
    

            await UserExists.updateOne({$push:{ProjectAccess:[NewProject._id]}});
         
         
            //store in history the Access Provided To New project
             const StoreUserAccessHistory =  await History.create({
                eventName: `User ${UserExists.FirstName} ${UserExists.LastName} added to project ${NewProject.ProjectName}`,
                eventItemType: 'user',
                eventItemId: NewProject._id,
                action: 'Provided Project Access',
                performedBy: UserExists._id,
                changes:{
                    oldValue:{
                        ProjectAccess:UserExists.ProjectAccess    
                    },
                    newValue:{
                        ProjectAccess:[...UserExists.ProjectAccess,NewProject._id]
                    }
                }
            });

              if(StoreUserAccessHistory){
            res.status(200).json({success:true,message:"Project Created",NewProject}); 
              }
        }else{
            return next({message:'Status Columns Creation Failed',statusCode:500}); 
          } 
        }
        }else{
        //If Project Already Exist with This Name
        return next({message:'Project Already Exists',statusCode:403});         
        }
        }else{
        //If No user is Found and No Admin is Found For the id
        return next({message:'UnAuthorized, User Not Found Please Provide A Valid User ID',statusCode:403});    
       }
    }else{
        //if id Not provided
        return next({message:'UnAuthorized,Please Provide CreatedBy User ID',statusCode:403});
    }
});

//Update a project
exports.UpdateProject = asyncerrorhandler(async (req, res,next) => {
    const user = req.user;
    const {projectID,UpdatedName,UpdatedDescription,UpdatedEstimatedStartDate,UpdatedEstimatedEndDate,Bin} = req.body;

    if(projectID && user){
       
        const ProjectExist = await Project.findById(projectID);
        if(ProjectExist){

        if(UpdatedName || UpdatedDescription || UpdatedEstimatedStartDate || UpdatedEstimatedEndDate || Bin){

            const updateProjectData = {}
            const oldValues = {}
         
   
            if(UpdatedName && UpdatedName!=='' && UpdatedName!==ProjectExist.ProjectName){
               updateProjectData.ProjectName = UpdatedName
               oldValues.ProjectName= ProjectExist.ProjectName
            }
            
            if(UpdatedDescription && UpdatedDescription!=='' && UpdatedDescription!==ProjectExist.Description){
               updateProjectData.Description = UpdatedDescription
               oldValues.Description= ProjectExist.Description
            }
            if(UpdatedEstimatedStartDate){
               updateProjectData.StartDate = UpdatedEstimatedStartDate
               oldValues.StartDate= ProjectExist.StartDate
            }
            if(UpdatedEstimatedEndDate){
               updateProjectData.EstimatedEndDate = UpdatedEstimatedEndDate
               oldValues.EstimatedEndDate= ProjectExist.EstimatedEndDate
            }
   
            let action='Updated';
            if(Bin){
               if(ProjectExist.Deleted){
                   updateProjectData.Deleted=false
                   oldValues.Deleted = true
                   action= "Restored" 
               }else{
                   updateProjectData.Deleted=true
                   oldValues.Deleted=false
                   action= "Deleted"  
               }
           }
   
   
               const UpdatedProject = await Project.findOneAndUpdate(
                   {_id : projectID},
                   { $set:updateProjectData},
                {new:true}
                );
                if(UpdatedProject){
                      //store in history the Project Update 
          await History.create({
            eventName: `${UpdatedProject.ProjectName}  ${action} by ${user.FirstName} ${user.LastName}`,
            eventItemType: 'project',
            eventItemId: UpdatedProject._id,
            action: 'Update',
            performedBy: user._id,
            changes:{
                oldValue:oldValues,
                newValue:updateProjectData
            }
        });

                 res.status(200).json({success:true,message:"Project Updated",UpdatedProject});
                }
                 }else{
              //No Field Changed
              return next({message:'Please provide Atleast One Field To Update',statusCode:403}); 
        }
        }else{
            //if Project Does Not exist
            return next({message:'UnAuthorized, Project Not Found Please Provide A Valid Project ID',statusCode:404});          
        }
       }else{
        if(!projectID){
        //If Project Id Not provided
        return next({message:'UnAuthorized, Project ID Not Found Please Provide A Valid Project ID',statusCode:403});    
        }else if(!user){
        //If Project Id Not provided
        return next({message:'Please Login',statusCode:403});         
        }  
    }
});

//Delete a Project
exports.DeleteProject = asyncerrorhandler(async (req, res,next) => {
    const {projectID} = req.body;
 
    if(projectID){
                await Project.findByIdAndUpdate({_id:projectID},{Deleted:true});
          res.status(200).json({success:true,message:"Project Deleted"});
    }else{
        //if id Not provided
        return next({message:'UnAuthorized,Please Provide Project ID',statusCode:403});
    }
});

//Get All Projects
exports.getAllProjects= asyncerrorhandler(async(req,res,next)=>{
   const user = await req.user;
    const {search,Bin,company} = req.body;

    if(user && company){
        const projectIdsWithAccess = user.ProjectAccess;
    const query = {
        _id: { $in: projectIdsWithAccess },
        Deleted:false,
        company:company
    };

    if (search) {
        query.ProjectName = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    if(Bin){
        query.Deleted=true
    }
           if(user.Role!=='admin'){
       const AllProjects = await Project.find(query).populate([
        {
        path:'createdBy',
        model:'user',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
    ]).sort({ createdAt: -1 });
          res.status(200).json({success:true,AllProjects});
        }else{
            const AllProjects = await Project.find({company:company}).populate([
                {
                path:'createdBy',
                model:'user',
                select:'FirstName LastName Email Role Approved AccessProvided'
               },
            ]).sort({ createdAt: -1 });
                  res.status(200).json({success:true,AllProjects});
                    
        }
        }
              
    
});

//Get Specific Project
exports.getSpecificProject = asyncerrorhandler(async(req,res,next)=>{
    const {id,projectID} = req.body;
 
    if(id && projectID){
        //Checking if Manager or Admin exists if either of them exists
       const UserExists = await User.findById(id);
      
       
       if(UserExists){
       const SpecificProject = await Project.findById(projectID).populate([
        {
        path:'createdBy',
        model:'user',
        select:'FirstName LastName Email Role Approved AccessProvided'
       },
    ]);
       if(SpecificProject){
          res.status(200).json({success:true,SpecificProject});
       }else{
        //If Project is Not Found
        return next({message:'Project Not Found, Check ID',statusCode:404});   
       }
        }else{
        //If No user is Found and No Admin is Found For the id
        return next({message:'UnAuthorized, User Not Found Please Provide A Valid User ID',statusCode:403});    
       }
    }else{
        //if id Not provided
        return next({message:'UnAuthorized,Please Provide CreatedBy User ID',statusCode:403});
    }
});








