import { CiViewTimeline } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";
import { CgBoard } from "react-icons/cg";
import { AiOutlineIssuesClose } from "react-icons/ai";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaSync } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks";
import { StoreProject } from "../../../redux/actions/ProjectActions";
import { Project } from "../../../Types/ProjectType";
import { StoreCompany } from "../../../redux/actions/CompanyActions";
import { MdHistory } from "react-icons/md";

type SideBarProps = {
  HoveredSideBar: boolean;
  setHoveredSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  HideSideBar: boolean;
  setHideSideBar: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({HideSideBar,HoveredSideBar,setHideSideBar,setHoveredSideBar}:SideBarProps) => {


const [Loading,setLoading]=useState(false);
const Location = useLocation();
const Path = Location.pathname;
const Navigate = useNavigate();
const {project} = useAppSelector((state)=>state.project);
const {user,loading,isAuthenticated} = useAppSelector((state)=>state.user);
const projectName = project && project.ProjectName.split(' ').join('');
const dispatch = useAppDispatch();

const fetchStoredProject = useCallback(async()=>{
  //console.log('Started');
  if(user && !loading){
  //  console.log('Started after user');
    const SavedState = localStorage.getItem('projectState');
  if(!SavedState){
   console.log(SavedState,'not found');
    // Navigate('/Projects');
   }else{
    try {
      setLoading(true);
      const  parsedData:Project =JSON.parse(SavedState);
      const id = user._id;
      const projectID = parsedData._id
      if(id && projectID){
    await dispatch(StoreProject({id,projectID}));
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
  fetchStoredProject()
 },[fetchStoredProject]);

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

const toggleSidebar = () => {
  setHideSideBar(!HideSideBar)
};

  return (
    !Loading && project?
    <div onMouseEnter={()=>setHoveredSideBar(true)} onMouseLeave={()=>setHoveredSideBar(false)} className={` h-full  relative bg-secondary py-5 select-none text-white flex flex-col`}>
   
   <IoIosArrowDropleftCircle onClick={toggleSidebar} size={25} className={`${HoveredSideBar?'':'hidden'} ${HideSideBar?'rotate-180 transition-all ease-in-out':'rotate-360 transition-all ease-in-out'} cursor-pointer opacity-80 hover:opacity-100 absolute right-[-10px]`}/>
    <h1 className={`${HideSideBar?'py-3 px-2':'text-lg pl-2'}  w-full border-b font-bold `}>Planning</h1>
        <div className='flex flex-col font-semibold'>
        
        <div onClick={()=>Navigate(`/projects/${projectName}/Timeline`)} className={`flex items-center gap-2 ${Path.includes('/Timeline')?'bg-background':''} hover:bg-background cursor-pointer py-3 ${HideSideBar?'justify-center':''} px-4`}>
        <CiViewTimeline size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Timeline')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Timeline</span>
        </div>

        <div onClick={()=>Navigate(`/projects/${projectName}/Board`)} className={`flex items-center gap-2 ${Path.includes('/Board')?'bg-background':''} hover:bg-background cursor-pointer py-3 ${HideSideBar?'justify-center':''} px-4`}>
        <CgBoard size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Board')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Board</span>
        </div>
        
        <div onClick={()=>Navigate(`/projects/${projectName}/Dashboard`)} className={`flex items-center gap-2 ${Path.includes('/Dashboard')?'bg-background':''} hover:bg-background cursor-pointer py-3 ${HideSideBar?'justify-center':''} px-4`}>
        <MdOutlineDashboard size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Dashboard')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Dashboard</span>
        </div>

        
        
        <div onClick={()=>Navigate(`/projects/${projectName}/Issues`)} className={`flex items-center gap-2 ${Path.includes('/Issues')?'bg-background':''} hover:bg-background cursor-pointer py-3 ${HideSideBar?'justify-center':''} px-4`}>
        <AiOutlineIssuesClose size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Issues')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Issues</span>
        </div>

        <div onClick={()=>Navigate(`/projects/${projectName}/Sync-Up`)} className={`flex items-center gap-2 ${Path.includes('/Sync-Up')?'bg-background':''} hover:bg-background cursor-pointer py-3 ${HideSideBar?'justify-center':''} px-4`}>
        <FaSync size={HideSideBar?20:16} className="text-white"/>
        <span className={`${Path.includes('/Sync-Up')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Sync-Up</span>
        </div>

        <div onClick={()=>Navigate(`/projects/${projectName}/History`)} className={`${HideSideBar?'justify-center':''} flex items-center gap-2 ${Path.includes('/Settings')?'bg-background':''} hover:bg-background cursor-pointer py-3 px-4`}>
        <MdHistory size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Settings')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>History</span>
        </div>
        
        </div>

        
        <hr className=""/>
        <div className='flex flex-col font-semibold'>
        <div onClick={()=>Navigate(`/projects/${projectName}/Bin`)} className={`${HideSideBar?'justify-center':''} flex items-center gap-2 ${Path.includes('/Bin')?'bg-background':''} hover:bg-background cursor-pointer py-3 px-4`}>
        <RiDeleteBin5Line size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Bin')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Bin</span>
        </div>

        <div onClick={()=>Navigate(`/projects/${projectName}/Settings`)} className={`${HideSideBar?'justify-center':''} flex items-center gap-2 ${Path.includes('/Settings')?'bg-background':''} hover:bg-background cursor-pointer py-3 px-4`}>
        <CiSettings size={HideSideBar?25:20} className="text-white"/>
        <span className={`${Path.includes('/Settings')?'':'hidden'} w-1 h-4 bg-white rounded-full shadow-lg absolute left-[1.2px]`}/>
        <span className={`${HideSideBar?'hidden':''}`}>Settings</span>
        </div>

        
        
        </div>


        
    </div>
    :

    <div onMouseEnter={()=>setHoveredSideBar(true)} onMouseLeave={()=>setHoveredSideBar(false)} className={` h-full  relative bg-secondary py-5 select-none text-white flex flex-col animate-pulse`} />
  )
}

export default SideBar