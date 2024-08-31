import { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci"
import { useAppSelector } from "../../../Hooks";
import { Apiconfig, TicketBaseApi } from "../../Constants/ApiConstants";
import { Ticket } from "../../../Types/TicketsType";
import axios from "axios";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import IssueData from "./IssueData";


function Issues() {
  const [focusedInput,setFocusedInput]=useState(false);
  const [search,setSearch]=useState('');
  const {user} = useAppSelector((state)=>state.user)
  const {project} = useAppSelector((state)=>state.project);
  const [tickets,setTickets]=useState<Ticket[]>([]);
  const [hoveredTicket,setHoveredTicket]=useState('');
  const [displayTicketMenu,setDisplayTicketMenu]=useState(false);

  const FetchTickets = useCallback(async()=>{
    if(user && project){
    
    try {
      const Route = `${TicketBaseApi}/All`;
      const body:{
        projectID:string,
        search:string
      } = {
        projectID : project._id,
        search : search
      }
      const {data} = await axios.post(Route,body,Apiconfig);
      if(data && data.tickets){
        setTickets(data.tickets as Ticket[]);
      }else{
        console.log(data);
      }
    } catch (error:any) {
      console.log(error);
    }
    
    }
    },[user,project,search]);

    useEffect(()=>{
      FetchTickets()
    },[FetchTickets]);

    const HandleAddTicketToBin = async(ticketId : string) =>{ 
      if(ticketId){
        try {
          console.log(ticketId,'id');
          const Route = `${TicketBaseApi}/Update`;
          const {data} = await axios.post(Route,{Bin:true,id:ticketId},Apiconfig);
          if(data){
            console.log(data);
            FetchTickets();
            setDisplayTicketMenu(false);
          }else{
            console.log('No Data Deleted');
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

  return (
    <div className="flex flex-col gap-5 w-full h-screen text-white p-10">
    <h1 className="text-xl font-bold">All Issues</h1>
      <div className={`max-w-[300px] w-max ${focusedInput?'':'border-white'} border-2 rounded-md text-white p-2 flex  items-center justify-between bg-transparent`}>
      <input  value={search} onChange={(e)=>setSearch(e.target.value)} type="text" onFocus={()=>setFocusedInput(true)} onBlur={()=>setFocusedInput(false)} className="w-[100px] focus:flex-1 bg-transparent transition-all duration-500 transform focus:w-[170px]  ease-in-out rounded-md px-2 outline-none placeholder:text-sm  text-base" placeholder={`${focusedInput?'Search in All Issues':''}`} /> 
       <CiSearch size={20} color="white"  className=""/>
       </div>

     <div className="w-full h-full flex flex-col gap-4 pb-12 overflow-x-hidden overflow-y-auto">
       {tickets &&  tickets.length>0?
        tickets.map((ticket)=>(
          <div onMouseEnter={()=>{
            setHoveredTicket(ticket._id);
          }}
          onMouseLeave={()=>{
            setHoveredTicket('');
            setDisplayTicketMenu(false);
          }}
          key={ticket._id + ticket.status}  className="bg-secondary  relative text-white gap-14  flex items-center  w-full py-2 px-3">
          {user && user.AccessProvided &&
           <div onClick={()=>{
            setDisplayTicketMenu(!displayTicketMenu);
           }} className={`${hoveredTicket===ticket._id?'':'hidden'} px-2 absolute bg-primary flex justify-center items-center  rounded-md right-2 top-2 cursor-pointer opacity-80 hover:opacity-100 text-white`}>
           <PiDotsThreeOutlineFill  size={20} className="text-white"/>
           </div>
         }
          {user && user.AccessProvided &&
           <div className={`${displayTicketMenu && hoveredTicket===ticket._id?'':'hidden'} absolute right-4 top-8 rounded-md py-1 min-w-[100px] bg-background`}>
           <button onClick={()=>HandleAddTicketToBin(ticket._id)} className="text-sm font-semibold w-full hover:bg-secondary">Bin This Ticket</button>
           </div>
           }
          <IssueData head={ticket.title} value={ticket.ticketName}/>
          <IssueData head='Type' value={ticket.type}/>
          <IssueData head='Status' value={ticket.status.StatusName}/>
          <IssueData head="assignedTo" value={ticket.assignedTo?.FirstName?ticket.assignedTo?.FirstName:'UnAssigned'} />
          <IssueData head="assignedby" value={ticket.assignedby?.FirstName} />
          <IssueData head="ProjectName" value={ticket.ProjectId.ProjectName} />
          <IssueData head="Created On" value={new Date(ticket.createdAt).toLocaleDateString()} />
          {ticket.description &&
          <IssueData head="description" value={ticket.description} />
           }
         </div>
         ))
      :
      <span className="md:text-xl text-center underline font-bold">No Ticket Found</span>
    }
    </div>

    </div>
  )
}

export default Issues