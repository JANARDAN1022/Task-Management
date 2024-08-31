import { useAppDispatch, useAppSelector } from "../../../Hooks"
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiSettings,CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { unwrapResult } from "@reduxjs/toolkit";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutUser } from "../../../redux/actions/UserActions";
import { useContext, useState } from "react";
import NavBarDropDown from "./NavBarDropDown";
import { MainContext } from "../../../context/MainContext";
import { Apiconfig, TicketBaseApi } from "../../Constants/ApiConstants";
import axios from "axios";
import { Ticket } from "../../../Types/TicketsType";

const Navbar = () => {
    const {user} = useAppSelector((state)=>state.user);
    const {project} = useAppSelector((state)=>state.project);
    const {company} = useAppSelector((state)=>state.company);
    const {setTickets,confirmDelete,editProject,viewProject,displayCreateModal,setDisplayCreateProject,setDisplayCreateModal,deleteColumn} = useContext(MainContext);
    const dispatch = useAppDispatch();
    const Navigate = useNavigate();
    const PathName = useLocation().pathname; 
    const [showMenu, setShowMenu] = useState('');
   

    const HandleLogout = async()=>{
      try {
       const response = await  dispatch(LogoutUser());
       const result = unwrapResult(response);
                   if(result?.success){
                    setShowMenu('');
                    Navigate("/Login");
                   }
      } catch (error) {
        console.log(error);
      }
   }

   const handleDropdownMenus = (dropdown:string)=>{
  if(dropdown){
    if(showMenu!== dropdown){
    setShowMenu(dropdown);
    }else{
      setShowMenu('');  
    }
  }
   }

   const FetchTickets = async (type?:string) => {
    if (user && project) {
      try {
        const Route = `${TicketBaseApi}/All`;
        const queryData:{
          projectID:string, 
          assignedTo:string,
          assignedby:string,
        } = {
          projectID:project._id, 
          assignedby:'',
          assignedTo:''
        }
        if(type){
        if(type==='assignedTo'){
          queryData.assignedTo=user._id;
        }else{
          queryData.assignedby=user._id;
        }
      }
        const { data } = await axios.post(Route,queryData,Apiconfig);
        if (data && data.tickets) {
          setTickets(data.tickets as Ticket[]);
        } else {
          console.log(data,'error no tickets data');
        }
      } catch (error: any) {
        console.log(error);
      }
    }
  }

  const HandlePrefix = (companyName:string)=>{
    if(companyName){
    return companyName.split(' ').join('').toUpperCase();
    }
  }

  return (
    <div className={`${displayCreateModal || (deleteColumn.Deleting && deleteColumn.DeleteColumnId!=='' && deleteColumn.StatusName!=='')?'blur pointer-events-none':''} ${confirmDelete.isOpen || editProject.isOpen || viewProject.isOpen?'blur select-none pointer-events-none ':''} w-full    py-1 px-6 shadow-md z-10 bg-primary flex justify-between items-center`}>
    
    <div className="flex gap-6 items-center text-white">
    <div className="flex h-14 w-14 items-center cursor-pointer">
    <img
        className="w-full h-full"
        src="/assets/Logo_Green.png"
        alt="logo"
      />
    </div>
    <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='Your Work'?'opacity-80':''} opacity-70 hover:opacity-100`}  
    onClick={()=>handleDropdownMenus('Your Work')}>Your Work</button>
    <IoIosArrowDown 
    onClick={()=>handleDropdownMenus('Your Work')}
    size={18} className={`${showMenu==='Your Work'?'rotate-180':'rotate-0'} cursor-pointer transition-all ease-in-out duration-300 mt-1`}/>
    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="Your Work"
    Fields={[{Field:'Assigned To me',onClickFunc() {
      FetchTickets('assignedTo')
    },},{Field:'Assigned By Me',onClickFunc() {
      FetchTickets('assignedby')
    },},
    {Field:'Fetch All Tickets',onClickFunc() {
      FetchTickets()
    },}
  ]}
    />
    </div>

    <div className="flex relative items-center gap-2  font-bold">
    <button className={`${showMenu==='Projects'?'opacity-90 underline':''} ${PathName.includes('Projects')?'opacity-100':'opacity-70 hover:opacity-100'} `} 
    onClick={()=>handleDropdownMenus('Projects')} >Projects</button>
        <IoIosArrowDown 
        onClick={()=>handleDropdownMenus('Projects')}
        size={18} className={`${showMenu==='Projects'?'rotate-180':'rotate-0'} cursor-pointer transition-all ease-in-out duration-300 mt-1`}/>
<div className={`${PathName.includes('Projects')?'':'hidden'} bg-white w-full h-1 bottom-[-20px] right-1 rounded-full absolute`}/>
    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="Projects"
    Fields={[
      {Field:'View All Projects',onClickFunc:()=>{
        if(company){
     setShowMenu('');
     Navigate(`/${HandlePrefix(company.name)}/Projects`);
      setDisplayCreateProject(false);
        }else{
          Navigate('/Company');
        }
    }},
    {Field:'Create New Project',onClickFunc:()=>{
      if(user && user.AccessProvided && company){
        Navigate(`/${HandlePrefix(company.name)}/Projects`);
      setShowMenu('');
      setDisplayCreateProject(true);
      }
    }}]}
    />
    </div>
    
    <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='Filters'?'opacity-90 underline':''}  opacity-70 hover:opacity-100`} onClick={()=>handleDropdownMenus('Filters')} >Filters</button>
        <IoIosArrowDown onClick={()=>handleDropdownMenus('Filters')}  size={18} className={`${showMenu==='Filters'?'rotate-180':'rotate-0'} cursor-pointer transition-all ease-in-out duration-300 mt-1`}/>

    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="Filters"
    Fields={[{Field:'Filter1'},{Field:'Filter2'}]}
    />
    </div>

    <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='DashBoard'?'opacity-90 underline':''} opacity-70 hover:opacity-100`} 
    onClick={()=>handleDropdownMenus('DashBoard')} >Dashboard</button>
        <IoIosArrowDown 
        onClick={()=>handleDropdownMenus('DashBoard')}
        size={18} className={`${showMenu==='DashBoard'?'rotate-180':'rotate-0'} cursor-pointer transition-all ease-in-out duration-300 mt-1`}/>

    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="DashBoard"
    Fields={[
      {Field:'Dashboard',onClickFunc:()=>{
      setShowMenu('')
      Navigate('/DashBoard')
    }},
    {Field:'Kan-board',onClickFunc:()=>{
      setShowMenu('')
      Navigate('/Board')
    }}
  ]}
    />
    </div>

    <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='Teams'?'opacity-90 underline':''} opacity-70 hover:opacity-100`} 
    onClick={()=>handleDropdownMenus('Teams')} >Teams</button>
        <IoIosArrowDown 
        onClick={()=>handleDropdownMenus('Teams')}
        size={18} className={`${showMenu==='Teams'?'rotate-180':'rotate-0'} cursor-pointer transition-all ease-in-out duration-300 mt-1`}/>

    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="Teams"
    Fields={[{Field:'Teams'}]}
    />
    </div>

     <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='Plans'?'opacity-90 underline':''} opacity-70 hover:opacity-100`} onClick={()=>Navigate('/Company')} >Company</button>
    </div> 

    {/* <div className="flex items-center gap-2 relative  font-bold">
    <button className={`${showMenu==='Apps'?'opacity-90 underline':''} opacity-70 hover:opacity-100`} onClick={()=>handleDropdownMenus('Apps')} >Apps</button>
        <IoIosArrowDown size={18} className={`${showMenu==='Apps'?'rotate-180':'rotate-0'} transition-all ease-in-out duration-300 mt-1`}/>

    <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="Apps"
    Fields={[{Field:'Apps'}]}
    />
    </div> */}

    <button onClick={()=>setDisplayCreateModal(true)} className={`${user && user.Approved && user.AccessProvided?'':'hidden'} bg-background text-white opacity-70 hover:opacity-100 p-2 rounded-md font-bold`}>Create</button>
    </div>

     <div className="flex gap-5 items-center">
      <div className="flex relative items-center">
      <input type="text" className="w-[250px] py-1 outline-none px-10 rounded-lg bg-transparent text-white border-2" placeholder="Search"/>
      <CiSearch size={20} className="absolute text-white left-2 top-1.6"/>
      </div>
      <IoIosNotificationsOutline size={25} className="text-white opacity-80 hover:opacity-100 cursor-pointer"/>
      <CiSettings size={25} className="text-white opacity-80 hover:opacity-100 cursor-pointer"/>
      
      <div  className="flex relative">
      <span onClick={()=>handleDropdownMenus('ProfileMenu')} className="bg-white cursor-pointer rounded-full py-1 px-3 font-bold text-2xl">{user?user.FirstName.slice(0,1):'Login'}</span>
     <NavBarDropDown 
    showMenu={showMenu}
    setShowMenu={setShowMenu}
    ShowMenuCheck="ProfileMenu"
    Fields={[
      {
        Field:'My Account',
        onClickFunc:()=>{
          if(user && project && project.ProjectName){
          Navigate(`/projects/${project.ProjectName}/Profile`);
          setShowMenu('');
          }
        }
      },
      {
      Field:'Logout',
    onClickFunc:HandleLogout
    }    
  ]}
    />
      </div>

     </div>

    </div>
  )
}

export default Navbar