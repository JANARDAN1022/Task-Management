import { useCallback, useContext, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { Apiconfig, ProjectBaseApi } from '../../Constants/ApiConstants';
import axios from 'axios';
import { Project } from '../../../Types/ProjectType';
import { ClearStoredProject, StoreProject } from '../../../redux/actions/ProjectActions';
import { unwrapResult } from '@reduxjs/toolkit';
import CreateProject from './CreateProject';
import { RxCross2 } from "react-icons/rx";
import UpdateProject from './UpdateProject';
import { MainContext } from '../../../context/MainContext';
import { StoreCompany } from '../../../redux/actions/CompanyActions';


const Projects = () => {

const {user,loading,isAuthenticated} = useAppSelector((state)=>state.user);
const {setProjects,displayCreateModal,displayCreateProject,setDisplayCreateProject, confirmDelete,editProject,setConfirmDelete,setEditProject,setviewProject,viewProject} = useContext(MainContext);
const [allprojects,setAllProjects]=useState<Project[]>([]);
const [Loading,setLoading]=useState(false);
const [searchProject,setSearchProject]=useState('');
const Location = useLocation();
const Path = Location.pathname;
const dispatch = useAppDispatch();
const Navigate = useNavigate();


const {company} = useAppSelector(state=>state.company);

const fetchStoredCompany = useCallback(async()=>{
  if(user && !loading){
    const SavedState = localStorage.getItem('companyState');
  if(!SavedState){
   console.log(SavedState,'not found');
    // Navigate('/Projects');
   }else{
    try {
      setLoading(true);
      const  parsedData:Project =JSON.parse(SavedState);
      const companyID = parsedData._id
      if(companyID){
    await dispatch(StoreCompany({companyId:companyID}));
      }
    setLoading(false);
 } catch (error) {
  setLoading(false);
   console.log(error);
 }
}
  }else{
    if(!user && !loading && !isAuthenticated){
   sessionStorage.setItem('prevPath', Path);
   Navigate('/Login');
    }
  }
},[user]);

 useEffect(()=>{
  fetchStoredCompany()
 },[fetchStoredCompany]);



// useEffect(()=>{
//  Notification.requestPermission().then(perm=>{
//   if(perm === 'granted'){
//     console.log('is granted');
//    new Notification("Example Notification");
//   }
//  })
// },[]);

const FetchProjects = useCallback(async(query?:boolean)=>{
if(user && !loading &&  isAuthenticated){
  console.log('fetching projects')
  if(user && user.Role!=='admin' && user.Approved===false){
    Navigate('/Wait-For-Approval');
   }else{
    if(company && !loading){
try {
  const SavedState = localStorage.getItem('projectState');
   if(SavedState){
   await dispatch(ClearStoredProject());
   }
  
   const Body:{
    company:string,
    search? :string,
   } = {
    company:company._id,
   }

   if(query){
    Body.search=searchProject;
   }
   const Route = `${ProjectBaseApi}/All`;
  setLoading(true);
  const {data} = await axios.post(Route,Body,Apiconfig); 
  if(data && data.AllProjects){
  //  console.log(data);
   setAllProjects(data.AllProjects);
   setProjects(data.AllProjects);
   setLoading(false)
  }else{
    console.log('no Data');
    setLoading(false);
  }
} catch (error) {
  console.log(error,'error Fetching Projects')
  setLoading(false);
}
}
   }
}else{
  sessionStorage.setItem('prevPath', Path);
   Navigate('/Login');
}
},[user,searchProject,company]);

useEffect(()=>{
  if(searchProject!==''){
    FetchProjects(true);
  }else{
    FetchProjects();
  }
 },[FetchProjects]);

 const HandlePrefix = (projectName:string)=>{
  if(projectName){
  return projectName.split(' ').join('').toUpperCase();
  }
}

const HandleStoreProject = async(id:string,projectID:string,projectName:string)=>{
  
  if(id && projectID){
  try {
    const response = await dispatch(
     StoreProject({id,projectID}),
     );
     const result = unwrapResult(response);
     if(result?.success){
      Navigate(`/projects/${HandlePrefix(projectName)}/Board`);
     }
  } catch (error) {
    console.log(error);
  }
}
}

const HandleCreateProject = async(Name:string,Description?:string,EstimatedEndDate?:Date | string,StartDate?:Date | string)=>{
  if(Name && user && company){
     try {
      setLoading(true);
         const Route = `${ProjectBaseApi}/Create`;
         const {data} = await axios.post(Route,
          {
            id:user._id,
            Name:Name,
            company:company._id,
            Description:Description?Description:'',
            EstimatedEndDate:EstimatedEndDate?EstimatedEndDate:'',
            StartDate:StartDate?StartDate:''
         },Apiconfig);
         if(data){
          // console.log(data);
          await FetchProjects();
         }
         setDisplayCreateProject(false);
         setLoading(false);
     } catch (error:any) {
      setLoading(false);
       console.log(error);       
     }
  }        
}

const HandleDeleteProject = async(projectID:string)=>{
  try {
    setLoading(true);
    const Route = `${ProjectBaseApi}/Delete`;
    const response = await axios.post(Route,{projectID:projectID},Apiconfig);
    if(response && response.data && response.data.success===true){
      // console.log(response.data,'delete Response');
      setConfirmDelete({
        isOpen:false,
        projectId:'',
        projectName:''
      });
      await FetchProjects();
    }
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
}

const HandleSearch = (e:any) =>{
e.preventDefault();
setSearchProject(e.target.value);
if(displayCreateProject){
  setDisplayCreateProject(false)
}
}

const HandleUpdateProject = async(updatedData:{
  UpdatedName:string,
  UpdatedDescription:string,
  UpdatedEstimatedStartDate:Date | string,
  UpdatedEstimatedEndDate:Date | string,
  projectID:string
})=> {
  try {
    setLoading(true);
    const Route = `${ProjectBaseApi}/Update`
    const {data} = await axios.post(Route, updatedData , Apiconfig);
    if(data && data.success){
      setEditProject({
        Editingproject:null,
        isOpen:false
      })
    FetchProjects();
    }
  } catch (error:any) {
    console.log(error);
  }
}







  return (
    !allprojects || !user?
    <div className='flex flex-col animate-pulse w-screen  h-screen bg-background justify-center items-center'>
      <span className='animate-bounce font-bold text-2xl text-center'>Fetching projects...</span>
    </div>
    :
    
    <div className={`${displayCreateModal?'blur pointer-events-none':''} flex flex-col   h-screen bg-background gap-5 relative`}>
    <div className={`${(confirmDelete.isOpen && confirmDelete.projectId!=='' && confirmDelete.projectName!=='') || (editProject.isOpen && editProject.Editingproject) || (viewProject.isOpen && viewProject.project)?'':'hidden' } absolute min-w-max p-2 max-w-[500px] max-h-[500px] min-h-max  z-[999] bg-primary ${editProject.isOpen?'left-[20%] top-24':'left-[35%] top-44'}    rounded-md shadow-md `}>
      {confirmDelete.isOpen?
      <div className='flex flex-col p-4 text-white font-bold'>
      <span>Are You Sure You Want To Delete This Project?</span>
      <div className='flex gap-2 items-center justify-center w-full mt-4'>
      <button className='bg-secondary hover:bg-background py-2 px-4 rounded-md text-white font-bold' onClick={()=>{
        setConfirmDelete({
          isOpen:false,
          projectId:'',
          projectName:''
       })
       }}>Cancel</button>
       <button onClick={()=>HandleDeleteProject(confirmDelete.projectId)} className='bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md text-white font-bold'>Delete {confirmDelete.projectName}</button>
      </div>
      </div>
       :editProject.isOpen && editProject.Editingproject?
       
       <UpdateProject setEditProject={setEditProject} project={editProject.Editingproject} HandleUpdateProject={HandleUpdateProject} />
       
       :viewProject.isOpen && viewProject.project?
       <div className='flex flex-col text-white gap-2 items-center relative py-6 px-4'>
         <RxCross2 onClick={()=>setviewProject({
          isOpen:false,
          project:null
         })} size={20} className='cursor-pointer opacity-80 hover:opacity-100 absolute top-2 right-5 text-white'/>
         <h1 className='text-center border-b w-full p-2'>{viewProject.project.ProjectName}</h1>
        {viewProject.project.createdBy && 
       <div className='flex gap-10'>
          <div className={`flex gap-2 items-center`}>
        <span>Created By :</span>
       <span>{viewProject.project.createdBy.FirstName}</span>
       </div>
       <div className={`flex gap-2 items-center`}>
        <span>Role :</span>
       <span>{viewProject.project.createdBy.Role}</span>
       </div>
       </div>
        }
        
        {viewProject.project.StartDate &&
          <div className={`flex gap-2 items-center`}>
           <span>Created on :</span>
          <span>{new Date(viewProject.project.createdAt).toLocaleString().split(',')[0]}</span>
          </div>
           }
        {viewProject.project.StartDate &&
          <div className={`flex gap-2 items-center`}>
          <span>{new Date(viewProject.project.StartDate).toLocaleDateString()!==new Date().toDateString() && new Date(viewProject.project.StartDate)<=new Date()?'Started on':'Estimated Start Date: '}:</span>
          <span>{new Date(viewProject.project.StartDate).toLocaleDateString()}</span>
         </div>
          }
          {viewProject.project.EstimatedEndDate?
            <div className={`flex gap-2 items-center`}>
            <span>{new Date(viewProject.project.EstimatedEndDate).toLocaleDateString()!==new Date().toDateString() && viewProject.project.EstimatedEndDate<=new Date()?'Ended on':'Estimated End Date: '}:</span>
            <span>{new Date(viewProject.project.EstimatedEndDate).toLocaleDateString()}</span>
           </div>
           :
           <div className={`flex gap-2 items-center`}>
            <span>End Date:</span>
            <span>N/A</span>
           </div> 
          }
          
        </div>
       :null  
    }
    </div>
    
    <div className={`${confirmDelete.isOpen || editProject.isOpen || viewProject.isOpen?'blur select-none pointer-events-none':''}  w-full flex justify-between items-center px-4`}>
    <div className='flex flex-col px-6 py-4  gap-2'>
    <h1 className='md:text-2xl text-white'>All Projects</h1>
    <input value={searchProject} onChange={HandleSearch} type='text' className='py-2 text-white px-4 ml-10 rounded-lg bg-transparent border-2 w-[200px] outline-none' placeholder='Search Projects'/>
    </div>
    <div>
    <button disabled={!user.AccessProvided} onClick={()=>{
      if(searchProject!==''){
        setSearchProject('');
      }
      setDisplayCreateProject(true)
    }} className={`${displayCreateProject || !user.AccessProvided?'hidden':''} py-3 px-4 rounded-md border-none bg-secondary hover:bg-secondary opacity-90 hover:opacity-100 text-white font-bold`}>Create New Project</button>
    <button disabled={!user.AccessProvided} onClick={()=>{
      if(searchProject!==''){
        setSearchProject('');
      }
      Navigate('/Projects/Bin');
    }} className={`${!user.Approved?'hidden':''} ${displayCreateProject?'mr-2':'ml-2'}  py-3 px-4 rounded-md border-none bg-secondary opacity-90 hover:opacity-100 hover:bg-secondary text-white font-bold`}>Project Bin</button>

    <button disabled={!user.AccessProvided} onClick={()=>{
      if(searchProject!==''){
        setSearchProject('');
      }
      setDisplayCreateProject(false)
    }} className={`${!displayCreateProject || !user.AccessProvided?'hidden':''} py-3 px-4 rounded-md border-none bg-secondary opacity-90 hover:opacity-100  text-white font-bold`}>Cancel</button>
    </div>
    </div>  
    {Loading?
    <div className='h-[500px] w-full animate-pulse bg-secondary ' />
    : 
    <div className={`w-full h-full ${confirmDelete.isOpen || editProject.isOpen || viewProject.isOpen?'blur':''} overflow-y-auto max-h-[525px] py-2 flex flex-col gap-5`}>
    {allprojects && !displayCreateProject && allprojects.length>0
       ?
      allprojects.map((project)=>(
        
        <div key={project._id}  className={`${confirmDelete.isOpen || editProject.isOpen || viewProject.isOpen?'blur pointer-events-none select-none':''} flex cursor-pointer py-4 px-6 mt-2  h-max font-bold text-white bg-secondary  justify-between items-center gap-2 w-full`}>
       <div className='flex flex-col gap-1'>
        <span onClick={()=>HandleStoreProject(user._id,project._id,project.ProjectName)} className='hover:underline font-bold opacity-90 hover:opacity-100 cursor-pointer'>{project.ProjectName}</span>
        <span  className='opacity-80 text-xs font-normal  cursor-default'>{project.Description}</span>
        </div>
       <div className='z-50 text-white font-bold flex gap-2 items-center'>
       <button onClick={()=>{
        setConfirmDelete({
          isOpen:true,
          projectId:project._id,
          projectName:project.ProjectName
        });
        setEditProject({
          Editingproject:null,
          isOpen:false
        })
        setviewProject({
          isOpen:false,
          project:null
        });
       }} className={`${user && user.AccessProvided?'':'hidden'} rounded-md bg-primary hover:bg-background py-2 px-4`} >Delete</button> 
       <button onClick={()=>{
        setConfirmDelete({
          isOpen:false,
          projectId:'',
          projectName:''
        });
        setEditProject({
          Editingproject:null,
          isOpen:false
        })
        setviewProject({
          project:project,
          isOpen:true
        });
       }} className={`${user && user.AccessProvided?'':'hidden'} rounded-md bg-primary hover:bg-background py-2 px-4`}>View</button>
       <button onClick={()=>{
        setConfirmDelete({
          isOpen:false,
          projectId:'',
          projectName:''
        });
        setEditProject({
          Editingproject:project,
          isOpen:true
        })
        setviewProject({
          project:null,
          isOpen:false
        });
       }} className={`${user && user.AccessProvided?'':'hidden'} rounded-md bg-primary hover:bg-background py-2 px-4`}>Edit</button>
       </div>
       
      </div>
      ))
      :
      user && user.AccessProvided?
       <CreateProject searchProject={searchProject} HandleCreateProject={HandleCreateProject}/>
      :
      searchProject===''?
        <h1 className='text-lg self-center flex text-center'>No Projects Found Please Contact Your Manager or Admin To Create one For You</h1>
      :
      <h1 className={`text-lg self-center flex text-center gap-2`}>No Project Found For <span className='bg-secondary text-white px-2 '>{searchProject}</span></h1>
    }
       </div>
      }
    </div>
  )
}

export default Projects

     