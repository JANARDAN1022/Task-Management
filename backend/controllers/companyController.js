const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const {run} = require('../controllers/awsController');
const crypto = require('crypto');
const tickets = require('../models/ticketModel');
const projects = require('../models/projectModel');


//Create a Company
exports.CreateCompany = asyncerrorhandler(async(req,res,next)=>{
    const user = req.user;
    const {name,description} = req.body;

    if(user){
   if(name){
    const members = [{
        user:user,
        role:'admin'
    }];

      const newCompany = await Company.create({name:name,createdBy:user._id,members:members,description:description?description:'',createdAt:Date.now()});
      
      if(newCompany){
        const companyJoined = {
          company:newCompany._id,
          role:'admin',
        }
        user.companies.push(companyJoined);
        await user.save();
       res.status(200).json({success:true,company:newCompany});
      }else{
        return next({message:'Company Not Created Please Check all the fields or try again later',statusCode:400});     
      }

   }else{
    return next({message:'Please provide Necessary Company Fields',statusCode:404});
   }
    }else{
        return next({message:'Please Log-In',statusCode:403});
    }
});


//Get All Companies created by specific user
exports.getYourCompanies = asyncerrorhandler(async(req,res,next)=>{
const user = req.user;
const {search}= req.body;

if(user){
  const query = {
    createdBy:user._id
  }
  if(search) {
    // Split the search term by spaces
 const searchTerms = search.split(/\s+/);

 // Construct the regex search with each search term
 const regexSearch = searchTerms.map(term => `(?=.*${term})`).join('');

 const regex = new RegExp(regexSearch, 'i');
 
  query.$or = [
     { name: { $regex: regex } },
 ];
}

    const yourCompanies = await Company.find(query);
    res.status(200).json({success:true,yourCompaniesExist:yourCompanies.length>0?true:false,companies:yourCompanies});
}else{
  return next({message:'Please Log-In',statusCode:403});
}
});


//Update Company Details
exports.UpdateCompany = asyncerrorhandler(async(req,res,next)=>{
const user = req.user;
const {companyId,name,description} = req.body;

if(user){
    if(companyId){
       const companyToUpdate = await Company.findOne({_id:companyId,createdBy:user._id});    

       if(companyToUpdate){
         const dataToUpdate = {};
         if(name){dataToUpdate.name = name;}
         if(description){dataToUpdate.description = description;}

         const UpdatedCompany = await Company.findByIdAndUpdate(companyId,dataToUpdate);

         res.status(200).json({success:true,UpdatedCompany})
       }else{
        return next({message:'Invalid Id or Company Does Not Exist',statusCode:404});  
       }

    }else{
      return next({message:'Please Provide the Company Id To Update',statusCode:404});
    }
}else{
  return next({message:'Please Log-In',statusCode:403});
}
});



// Get All Companies User joined
exports.getAllJoinedCompanies = asyncerrorhandler(async (req, res, next) => {
  const user = req.user;
  const {search} = req.body;
  if (user) {
    const query = {
      members: { $elemMatch: { user: user._id } },
  }
    if(search) {
      // Split the search term by spaces
   const searchTerms = search.split(/\s+/);
  
   // Construct the regex search with each search term
   const regexSearch = searchTerms.map(term => `(?=.*${term})`).join('');
  
   const regex = new RegExp(regexSearch, 'i');
   
    query.$or = [
       { name: { $regex: regex } },
   ];
  }
      const companiesJoined = await Company.find(query);
      console.log('companies are;-',companiesJoined)
      res.status(200).json({ 
          success: true, 
          companiesJoined, 
          companiesExist: companiesJoined.length > 0 
      });
  } else {
      return next({ message: 'Please Log-In', statusCode: 403 });
  }
});


//Delete Your Company
exports.deleteYourComapny =  asyncerrorhandler(async(req,res,next)=>{
    const user = req.user;
    const {companyId} = req.body;

    if (user && companyId) {
      const companyProjects = await projects.find({company:companyId});
      if (companyProjects.length > 0) {
        console.log('Projects are:-',companyProjects);
        // all project IDs
        const projectIds = companyProjects.map(project => project._id);
        console.log('projectIds are:-',projectIds,'ToString:-',projectIds.toString());
        
        // Delete all tickets associated with these projects
        await tickets.deleteMany({ ProjectId: { $in: projectIds } });

        // Delete the projects themselves
        await projects.deleteMany({ _id: { $in: projectIds } });
    }
      const companyToDelete = await Company.findOneAndDelete({_id:companyId,createdBy:user._id});
      
      if(companyToDelete){
      res.status(200).json({ 
          success: true, 
          Message:'Company Deleted Successfully'
          });
    
    }else{
      return next({ message: 'Company Does Not Exist or You are not authorized', statusCode: 404 });
    }
  } else {
      return next({ message: 'Please Log-In', statusCode: 403 });
  }
});


// Join A company
exports.joinCompany = asyncerrorhandler(async(req,res,next)=>{
const user = req.user;
const {code} = req.body;

    if (user && code) {
      const companyToJoin = await Company.findOne({
        invitedUsers: {
          $elemMatch: {
            code: code,
            userEmail: user.email
          }
        }
      });

      if(companyToJoin){
        const invitedUser = companyToJoin.invitedUsers.find((inviteduser)=>inviteduser.code===code);
        if(invitedUser){

        if(invitedUser.expires < Date.now()){
          companyToJoin.invitedUsers = companyToJoin.invitedUsers.filter(
            (invite) => invite.code !== code || invite.userEmail !== user.email
          );

          await companyToJoin.save();
             return next({ message: 'Invitation Expired', statusCode: 400 });
        }else{
          companyToJoin.members.push({ userId: user._id, role: 'employee' });
          user.companies.push({
            company: companyToJoin._id,
          role:'employee', 
          joinedOn: Date.now(),
          })
          companyToJoin.invitedUsers = companyToJoin.invitedUsers.filter(
            (invite) => invite.code !== code || invite.userEmail !== user.email
          );

          await companyToJoin.save();

      res.status(200).json({ 
          success: true, 
          Message:'Company Joined Successfully'
          });
        }
    }else{
      return next({ message: 'Inavlid Code', statusCode: 404 });
    }
  }
  } else {
      return next({ message: 'Please Log-In', statusCode: 403 });
  }
});


// Invite user to a company
exports.inviteUser = asyncerrorhandler(async (req, res, next) => {
  const { companyId, userEmail, role } = req.body;

  if (!companyId || !userEmail || !role) {
      return next({ message: 'Please provide all required fields', statusCode: 400 });
  }

  const company = await Company.findById(companyId);

  if (!company) {
      return next({ message: 'Company not found', statusCode: 404 });
  }

  // Generate invitation code
  const inviteCode = crypto.randomBytes(20).toString('hex');
  const inviteExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

  company.invitedUsers.push({ code: inviteCode, userEmail, expires: inviteExpires });
  await company.save();

  // Send invitation email 
  const inviteUrl = `${req.protocol}://${req.get('host')}/company/join/${inviteCode}`;
  const subject = 'You Are Invited!';
  const message = `You have been invited to join the company. Click the link below to accept the invitation: ${inviteUrl}`;

  await run(userEmail, 'Invitation to Join Company', subject, message);

  res.status(200).json({ success: true, message: 'Invitation sent successfully' });
});


// Approve user's role
exports.approveUserRole = asyncerrorhandler(async (req, res, next) => {
  const { userId, companyId, newRole } = req.body;

  if (!userId || !companyId || !newRole) {
      return next({ message: 'Please provide all required fields', statusCode: 400 });
  }

  // Check if the requesting user has the right permissions
  const company = await Company.findById(companyId).populate('members.user');
  const user = company.members.find(member => member.user._id.toString() === req.user.id);
  
  if (!user || user.role !== 'admin') {
      return next({ message: 'You do not have permission to approve roles', statusCode: 403 });
  }

  const targetUser = await User.findById(userId);

  if (!targetUser) {
      return next({ message: 'User not found', statusCode: 404 });
  }

  // Approve the user and assign the new role
  const companyUser = targetUser.companies.find(c => c.company.toString() === companyId);
  if (companyUser) {
      companyUser.role = newRole;
      await targetUser.save();
  }

  res.status(200).json({ success: true, message: 'User role approved successfully' });
});


//get specific company 
exports.getSpecificCompany = asyncerrorhandler(async(req,res,next)=>{
   const {companyId} = req.body;
   const user = req.user;

   if(companyId && user){
     const requestedCompany = await Company.findById(companyId);
     if(requestedCompany){
       res.status(200).json({success:true,company:requestedCompany});
     }else{
      return next({ message: 'Company not found', statusCode: 404 }); 
     }
   }else{
     if(!user){
      return next({ message: 'User not found or not authorized', statusCode: 404 });
     }else{
      return next({ message: 'Please provide company ID', statusCode: 404 });
     }
   }
});