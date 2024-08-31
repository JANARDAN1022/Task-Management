import { useCallback, useContext, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { Apiconfig, ProjectBaseApi } from '../../Constants/ApiConstants';
import axios from 'axios';
import { Project } from '../../../Types/ProjectType';
import { ClearStoredProject} from '../../../redux/actions/ProjectActions';
import { MainContext } from '../../../context/MainContext';
import { StoreCompany } from '../../../redux/actions/CompanyActions';


const ProjectsBin = () => {

const {user,loading,isAuthenticated} = useAppSelector((state)=>state.user);
const {company} = useAppSelector(state=>state.company);
const {displayCreateModal} = useContext(MainContext);
const [projects,setProjects]=useState<Project[]>([]);
const [Loading,setLoading]=useState(false);
const [searchProject,setSearchProject]=useState('');
const Location = useLocation();
const Path = Location.pathname;
const dispatch = useAppDispatch();
const Navigate = useNavigate();



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



const FetchProjects = useCallback(async(query?:boolean)=>{
if(user && !loading &&  isAuthenticated && company){
  if(user && user.Role!=='admin' && user.Approved===false){
    Navigate('/Wait-For-Approval');
   }else{
try {
  const SavedState = localStorage.getItem('projectState');
   if(SavedState){
   await dispatch(ClearStoredProject());
   }

   const Body:{
    Bin:boolean
    company:string
    search? :string,
   } = {
   Bin:true,
   company:company._id
   }

   if(query){
    Body.search=searchProject;
   }

   const Route = `${ProjectBaseApi}/All`;
  setLoading(true);
  const {data} = await axios.post(Route,Body,Apiconfig); 
  if(data && data.AllProjects){
  //  console.log(data);
   setProjects(data.AllProjects)
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
}else{
  sessionStorage.setItem('prevPath', Path);
   Navigate('/Login');
}
},[user,searchProject]);

useEffect(()=>{
  if(searchProject!==''){
    FetchProjects(true);
  }else{
    FetchProjects();
  }
 },[FetchProjects]);





 const HandlePrefix = (companyName:string)=>{
  if(companyName){
  return companyName.split(' ').join('').toUpperCase();
  }
}


 const HandleRestoreProject = async(projectID:string)=> {
    if(company){  
  try {
      setLoading(true);
      const Route = `${ProjectBaseApi}/Update`
      const {data} = await axios.post(Route, {Bin:true,projectID:projectID},Apiconfig);
      if(data && data.success){
        console.log(data);
        Navigate(`/${HandlePrefix(company.name)}/Projects`);
      }
    } catch (error:any) {
      console.log(error);
    }
  }
  }


const HandleSearch = (e:any) =>{
e.preventDefault();
setSearchProject(e.target.value);
}







  return (
    !projects || !user?
    <div className='flex flex-col animate-pulse w-screen  h-screen bg-background justify-center items-center'>
      <span className='animate-bounce font-bold text-2xl text-center'>Fetching projects...</span>
    </div>
    :
    
    <div className={`${displayCreateModal?'blur pointer-events-none':''} flex flex-col  h-screen bg-background gap-5 relative`}>
    <div className={` w-full flex justify-between items-center px-4`}>
    <div className='flex flex-col px-6 py-4  gap-2'>
    <h1 className='md:text-2xl text-white'>All Projects In Bin</h1>
    <input value={searchProject} onChange={HandleSearch} type='text' className='py-2 px-4 ml-10 rounded-md w-[200px] outline-none' placeholder='Search Projects'/>
    </div>
    </div>  
    {Loading?
    <div className='h-[500px] w-full animate-pulse bg-secondary ' />
    : 
    <div className={`w-full h-full overflow-y-auto max-h-[525px] py-2 flex flex-col gap-5`}>
    {projects && projects.length>0
       ?
      projects.map((project)=>(
        
        <div key={project._id}  className={`flex cursor-pointer py-4 px-6 mt-2  h-max font-bold text-white bg-secondary  justify-between items-center gap-2 w-full`}>
       <div className='flex flex-col gap-1'>
        <span className='hover:underline font-bold opacity-90 hover:opacity-100 cursor-pointer'>{project.ProjectName}</span>
        <span  className='opacity-80 text-xs font-normal  cursor-default'>{project.Description}</span>
        </div>
       <div className='z-50 text-white font-bold flex gap-2 items-center'>
       <button onClick={()=>HandleRestoreProject(project._id)} className={`${user && user.AccessProvided?'':'hidden'} rounded-md bg-background hover:opacity-100 opacity-90 py-2 px-4`} >
        Restore Project
        </button> 
       </div>
    
      </div>
      ))
      :
      searchProject===''?
        <h1 className='text-lg self-center flex text-center text-white'>No Projects In The Bin <span onClick={()=>{
          if(company){
            Navigate(`/${HandlePrefix(company.name)}/Projects`);
          }
        }} className='ml-2 cursor-pointer text-white font-bold hover:underline'>View All Projects</span></h1>
      :
      <h1 className={`text-lg self-center flex text-center gap-2 text-white`}>No Project Found In The Bin For <span className='bg-secondary text-white px-2 '>{searchProject}</span></h1>
    }
       </div>
      }
    </div>
  )
}

export default ProjectsBin

     