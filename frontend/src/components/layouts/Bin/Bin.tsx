import { useCallback, useEffect, useState } from "react"
import { useAppSelector } from "../../../Hooks";
import { Apiconfig, TicketBaseApi } from "../../Constants/ApiConstants";
import axios from "axios";
import { Ticket } from "../../../Types/TicketsType";
import { TbTrashOff } from "react-icons/tb";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { CiSearch } from "react-icons/ci";



const Bin = () => {

  const {user} = useAppSelector((state)=>state.user);
  const [BinTickets,setBinTickets]=useState<Ticket[]>([]);
  const {project} = useAppSelector((state)=>state.project);
  const [hoveredTicket,setHoveredTicket]=useState({
    Restore:'',
    Delete:''
  });
  const [focusedInput,setFocusedInput]=useState(false);
  const [search,setSearch]=useState('');
 
  const [Loading,setLoading]=useState(false);


const FetchTicketsInBin = useCallback(async()=>{
if(user && project){

try {
  setLoading(true);
  const Route = `${TicketBaseApi}/All`;
  const body:{
    projectID:string,
    Bin:boolean,
    search:string
  } = {
    projectID : project._id ,
    Bin : true ,
    search : search
  }
  const {data} = await axios.post(Route,body,Apiconfig);
  if(data && data.tickets){
    setBinTickets(data.tickets as Ticket[]);
  }else{
    console.log(data);
  }
  setLoading(false)
} catch (error:any) {
  console.log(error);
  setLoading(false)
}

}
},[user,project,search]);

  useEffect(()=>{
FetchTicketsInBin()
  },[FetchTicketsInBin]);

  const HandleRestoreTicket = async(ticketId : string) =>{ 
    if(ticketId){
      try {
       // console.log(ticketId,'id');
        const Route = `${TicketBaseApi}/Update`;
        const {data} = await axios.post(Route,{Bin:true,id:ticketId},Apiconfig);
        if(data){
          console.log(data);
          FetchTicketsInBin();
        }else{
          console.log('No Data Deleted');
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

 
  return (
    <div className="w-full text-white  h-screen max-h-screen p-10 gap-5 flex flex-col pb-16 overflow-y-auto">
             
      <h1 className="text-xl font-bold">Tickets In Bin</h1>
      <div className={`max-w-[300px] w-max ${focusedInput?'':'border-white'} border-2 rounded-md  p-2 flex  items-center justify-between text-white`}>
      <input  value={search} onChange={(e)=>setSearch(e.target.value)} type="text" onFocus={()=>setFocusedInput(true)} onBlur={()=>setFocusedInput(false)} className="w-[100px] focus:flex-1 bg-transparent transition-all duration-500 transform focus:w-[170px]  ease-in-out rounded-md px-2 outline-none placeholder:text-sm  text-base" placeholder={`${focusedInput?'Search in Bin':''}`} /> 
       <CiSearch size={20} color="white"  className=""/>
       </div>
      {BinTickets && BinTickets.length>0?
      !Loading?
     <div className={`w-full py-5 h-full flex flex-col gap-2`}>
    {BinTickets.map((BinTicket)=>(
      <div key={BinTicket._id} className="flex text-white font-bold px-10 p-2 justify-between gap-2 bg-secondary items-center w-full">
      <div className="flex gap-3 items-center">
      <span>{BinTicket.title}</span>
      <span>{BinTicket.ticketName}</span>
     </div>

      {user && user.AccessProvided &&
     <div className="flex gap-2 items-center">
     <div onClick={()=>HandleRestoreTicket(BinTicket._id)} onMouseEnter={()=>setHoveredTicket({Restore:BinTicket._id,Delete:''})} onMouseLeave={()=>setHoveredTicket({Restore:'',Delete:''})} className="flex cursor-pointer items-center gap-3">
      <span className={`${hoveredTicket.Restore===BinTicket._id?'':'hidden'}`}>Restore {BinTicket.ticketNumber}</span>
      <MdOutlineSettingsBackupRestore size={30} className="cursor-pointer"/>
     </div>

     </div>
       }
    </div>
     ))
    }
     </div>
     :
     <div className="w-full  h-full overflow-hidden bg-green-600 animate-pulse">
     {/* Loading */}
     </div>
    :
     <div className="w-full text-white h-full justify-center items-center flex">
        <div className="flex flex-col gap-3 items-center">
        <TbTrashOff  className="md:text-6xl"/>
        <span className="text-center md:text-2xl font-bold underline">{project?.ProjectName} Has No Tickets In The Bin {search!==''?`for ${search}`:''}</span>
       </div>
     </div>
    }
    </div>
  )
}

export default Bin