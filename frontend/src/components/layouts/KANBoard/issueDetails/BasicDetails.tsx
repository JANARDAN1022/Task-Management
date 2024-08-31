import React, { useCallback, useEffect, useState } from 'react'
import { Ticket } from '../../../../Types/TicketsType';
import { CiSearch } from 'react-icons/ci';
import { User } from '../../../../Types/UserTypes';
import IssueHistory from './IssueHistory';
import { TicketHistoryType } from '../../../../Types/HistoryType';
import { Apiconfig, HistoryBaseApi, UserBaseApi } from '../../../Constants/ApiConstants';
import axios from 'axios';
import { useAppSelector } from '../../../../Hooks';
import { ImAttachment } from "react-icons/im";


type ticketInfoProps = {
  page:number
  setPageNumber: React.Dispatch<React.SetStateAction<number>>
    ticketHistory: TicketHistoryType[]
    editTitle: boolean
    setEditTitle: (value: React.SetStateAction<boolean>) => void
    newTitleRef: React.RefObject<HTMLInputElement>
    HandleUpdateTicket: (status?: string, Newparent?: string, Children?: string, estimatedTime?: string, loggedInTime?: string, childrenIdRemoved?: string) => Promise<void>
    ticket: Ticket
    setNewTitle: (value: React.SetStateAction<string>) => void
    newTitle: string
    displayChildIssue: boolean
    setDisplayChildIssue: (value: React.SetStateAction<boolean>) => void
    NewChildIssueRef: React.RefObject<HTMLInputElement>
    editDescription: boolean
    setEditDescription: (value: React.SetStateAction<boolean>) => void
    setNewDescription: (value: React.SetStateAction<string>) => void
    ExistingChildIssueRef: React.RefObject<HTMLDivElement>
    newChildIssueTitle: string
    setNewChildIssueTitle: (value: React.SetStateAction<string>) => void
    childIssueSearchRef: React.RefObject<HTMLInputElement>
    childrenTickets: Ticket[]
    HandleCreateNewChildIssue: (e: any) => Promise<void>
    setChooseExistingIssues: (value: React.SetStateAction<boolean>) => void
    chooseExistingIssues: boolean
    showActivity: {
        All: boolean;
        Comments: boolean;
        History: boolean;
    }
    setshowActivity: (value: React.SetStateAction<{
        All: boolean;
        Comments: boolean;
        History: boolean;
    }>) => void
    descriptionRef: React.RefObject<HTMLTextAreaElement>
    newDescription: string
    selectTypeRef: React.RefObject<HTMLSelectElement>
    newChildIssueType: string
    setNewChildIssueType: React.Dispatch<React.SetStateAction<string>>
    user: User 
    searchChildrenTickets:string
    setSearchChildrenTickets: React.Dispatch<React.SetStateAction<string>>
    FetchTicketHistory: () => Promise<void>
    showLoadMore:boolean
    setTicketHistory: React.Dispatch<React.SetStateAction<TicketHistoryType[]>>
    setShowLoadMore:React.Dispatch<React.SetStateAction<boolean>>
    scrollHistoryRef: React.RefObject<HTMLDivElement>
}


const BasicDetails = ({
  scrollHistoryRef,
  setShowLoadMore,
  setTicketHistory,
  showLoadMore,
  page,
  setPageNumber,
    ticketHistory,
    FetchTicketHistory,
    setNewChildIssueType,
    newChildIssueType,
    selectTypeRef,
    newDescription,
    descriptionRef,
    HandleUpdateTicket,
    NewChildIssueRef,
    displayChildIssue,
    editDescription,
    editTitle,
    newTitle,
    newTitleRef,
    setDisplayChildIssue,
    setEditDescription,
    setEditTitle,
    setNewDescription,
    setNewTitle,
    ticket,
    ExistingChildIssueRef,
    childIssueSearchRef,
    childrenTickets,
    newChildIssueTitle,
    setNewChildIssueTitle,
    HandleCreateNewChildIssue,
    chooseExistingIssues,
    setChooseExistingIssues,
    setshowActivity,
    showActivity,
    user,
    searchChildrenTickets,
    setSearchChildrenTickets
}:ticketInfoProps) => {

  
//Testing History Filters
  const [specificField,setSpecificField] = useState('');
  const [usersWithProjectAccess,setUsersWithProjectAccess] = useState<User[] | null>(null);
  const [loadingUsers,setLoadingUsers]=useState(false);
  const [performedBy,setPerformedBy]=useState('');

  

  const FetchFilteredHistory = async()=>{
    if(page>0 && ticket){
      try {
        const Route = ` ${HistoryBaseApi}/ticket/specific`;
        const Body:{
          ticketId:string,
          page:number,
          updatedField:string,
          performedBy:string    
        } = {
          ticketId:ticket._id,
          page:page,
          updatedField:specificField,
          performedBy:performedBy      
        }
        console.log('filtered Fetch Started',Body);
        const {data} = await axios.post(Route,Body,Apiconfig);
        if(data && data.TicketHistory){
          console.log(data);
             setTicketHistory(data.TicketHistory as TicketHistoryType[]) 
           setShowLoadMore(data.hasNextPage);
          }else{
            console.log('no data history ticket');
        }
      
    } catch (error) {
        console.log(error);
      
    }
    }
    }
    
  useEffect(()=>{
    FetchFilteredHistory();
  },[specificField,performedBy]);

const {project} = useAppSelector((state)=>state.project);

  const FetchUsersWithprojectAccess = useCallback(async () => {
    if (project && ticket && !loadingUsers) {
      try {
        setLoadingUsers(true);
        const Route = `${UserBaseApi}/All`;
        const { data } = await axios.post(Route,{projectID:project._id}, Apiconfig);
        if (data && data.success) {
          setUsersWithProjectAccess(data.UsersWithAccess as User[]);
        } else {
          console.log("no data user project access fetch");
        }
        setLoadingUsers(false);
      } catch (error) {
        console.log(error);
        setLoadingUsers(false);
      }
    }
  },[project,ticket]);



useEffect(()=>{
  FetchUsersWithprojectAccess()
},[FetchUsersWithprojectAccess]);


  useEffect(()=>{
    if(ticket.title){
      setNewTitle(ticket.title);
    }
     if(ticket.description){
       setNewDescription(ticket.description)
     }
     //else{
    //   setNewDescription('');
    // }
  },[ticket]);


  useEffect(()=>{
if(!showActivity.History && page>1){
  setPageNumber(1);
}
  },[showActivity.History]);



  

  return (
    <div className="flex flex-col max-h-full overflow-y-auto gap-2 flex-[2]  px-4">
    <div className="flex flex-col w-full">
      {!editTitle?
     <h1  onClick={()=>{
      setEditTitle(true)
    if(displayChildIssue){
      setDisplayChildIssue(false);
    }
    }} className="font-bold  lg:text-xl hover:bg-primary hover:text-white p-2 cursor-text">{ticket.title}</h1>
       :  
       <input ref={newTitleRef}  onBlur={()=>setEditTitle(false)} 
       onKeyDown={(e)=>{
        if(e.key==='Enter'){
          e.preventDefault();
          HandleUpdateTicket();
        }
       }} 
       onChange={(e)=>setNewTitle(e.target.value)} className="font-bold outline-none lg:text-xl bg-primary text-white p-2" value={newTitle}/>
    }
   
    <div className="w-full flex items-center gap-2 p-1">
       <button className="flex items-center gap-2 bg-ticketBtns  rounded-md py-2 px-4 font-bold opacity-80 hover:opacity-100">
        <ImAttachment size={20}/>
        <span>Attach</span>
        </button>
       {ticket.type!=='subTask' &&
       <button onClick={()=>{
        if(!displayChildIssue){
        setDisplayChildIssue(true)
        }else{
          if(NewChildIssueRef.current){
            NewChildIssueRef.current.focus()
          }
        }
        }} className="bg-ticketBtns  rounded-md py-2 px-4 font-bold opacity-80 hover:opacity-100">Add a Child Issue</button>
      }
   </div>

 </div>
  
         <div className="flex justify-center w-full gap-2 flex-col items-center">
          <h1 className="justify-start flex w-full font-bold underline ">Description</h1>
          {ticket.description && ticket.description!=='' && !editDescription?
          <span onClick={()=>setEditDescription(true)} className="w-full hover:bg-background text-white p-2 cursor-text">{ticket.description}</span>  
          :
          <textarea
          ref={descriptionRef}
          onBlur={()=>{
            if(ticket.description){
              setNewDescription(ticket.description)

            }
            setEditDescription(false)
          }}
          value={newDescription}
          placeholder={newDescription!==''?newDescription:"Add a Description"}
          onChange={(e)=>setNewDescription(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key==='Enter'){
              e.preventDefault();
              HandleUpdateTicket();
            }
           }} 
          className="border-black border-2 w-full min-h-[140px] resize-none py-2 px-6"
          />
          
          
        }
         </div>
  
         
         <div className="w-full flex flex-col gap-1">
            <h1 className={`${(ticket.children && ticket.children.length>0) || displayChildIssue?'':'hidden'} flex w-full  font-bold underline`}>Child Issue</h1>
            {displayChildIssue &&  
          <div className="w-full flex flex-col gap-1"> 
          {!chooseExistingIssues?
            <div className="flex  items-center w-full ">
              <select ref={selectTypeRef} value={newChildIssueType}  onChange={(e)=>setNewChildIssueType(e.target.value)} className="p-2  cursor-pointer font-bold text-sm bg-ticketBtns focus:opacity-100 opacity-80  h-10 outline-none min-w-[100px] rounded-bl-md rounded-tl-md">
              <option value={''}>Select</option>
              {ticket.type==='epic' && 
             <option value='story'>Story</option> 
              }
              {(ticket.type==='epic' || ticket.type==='story') &&
               <option  value='task'>Task</option>
              }
               
              <option value='subTask'>Sub Task</option>
             
              </select>
              <input value={newChildIssueTitle} onChange={(e)=>setNewChildIssueTitle(e.target.value)} ref={NewChildIssueRef} type="text" className="flex-1 py-[6.5px] px-8 focus:opacity-100 border-black border-l-0 border  outline-none font-bold text-black   rounded-tr-md rounded-br-md" placeholder="Add a Title For the Ticket" />
            </div>
            :
            <div ref={ExistingChildIssueRef} className="flex relative items-center w-full">
              <input value={searchChildrenTickets} onChange={(e)=>setSearchChildrenTickets(e.target.value)} ref={childIssueSearchRef} type="text" className="flex-1 py-2 px-8 focus:bg-background border-none outline-none text-white font-bold placeholder:text-white bg-secondary  rounded-tr-md " placeholder="Search For For the Ticket" />
              <div className="absolute overflow-y-auto font-bold bg-primary  flex flex-col top-10 w-full z-[999] h-[100px] py-2 rounded-bl-md rounded-br-md shadow-md text-black">
              {childrenTickets && childrenTickets.length>0?
              childrenTickets.map((children)=>(
                <span onClick={()=>{
                  HandleUpdateTicket('','',children._id,'','','');
                }} key={children._id + children.ticketName + ticket.title}  className="w-full py-2 px-4 hover:bg-background cursor-pointer text-center text-white">{children.title}</span>  
              ))
              :
               <span className="w-full py-2 px-4 cursor-default text-center text-white">No Tickets Found</span>  
                }
               </div>
            </div>
            } 
            <div className="flex w-full px-4 p-2 items-center justify-between">
              <div className="flex hover:underline transition-all duration-300 ease-in-out items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
              <CiSearch size={20} className={`${chooseExistingIssues?'hidden':''} text-white`}/>
              <span onClick={()=>{
                setChooseExistingIssues(!chooseExistingIssues);
              }} className="">{!chooseExistingIssues?'Search For Existing Issues/Tickets':'Create New Issue/Ticket'}</span>
              </div>
              <div className="flex gap-2 items-center">
              <button onClick={(e)=>HandleCreateNewChildIssue(e)} className='bg-background text-white py-1 px-4 opacity-80 hover:opacity-100 rounded-sm'>Create</button>
              <button onClick={()=>{
                setDisplayChildIssue(false);
                setSearchChildrenTickets('');
                }}
                className='bg-ticketBtns text-black py-1 px-4 opacity-80 hover:opacity-100 rounded-sm'
                >Cancel</button>
              </div>
            </div>
            </div>
         }
         {ticket.children && ticket.children.length>0 && ticket.children.map((children)=>(
          <div key={children._id + children.ticketName} className="w-full relative p-2 bg-background  transition-all ease-in-out text-white duration-300 font-bold flex justify-center items-center text-center " >
          <span className='hover:underline cursor-pointer'> {children.ticketName} </span>
          <button onClick={()=>HandleUpdateTicket('','','','','',children._id)} className='bg-ticketBtns text-black  absolute right-5   transition-all duration-300 ease-in-out py-1 rounded-md px-4 opacity-80 z-[999] hover:opacity-100 text-sm'>Remove</button>
          </div>
         ))}
         </div>
          
        
  
          <div className="w-full pb-5 flex flex-col min-h-[250px] max-h-[250px] overflow-y-auto gap-2">
           <h1 className="font-bold underline">Activity</h1>
           <div className="flex gap-3 items-center  w-full p-2">
              <h1>Show:</h1>
              <button onClick={()=>setshowActivity({
                 All:true,
                 Comments:false,
                 History:false
              })} className={`${showActivity.All?'bg-background text-white':'bg-ticketBtns opacity-80 hover:opacity-100'}  rounded-md py-2 px-3 font-bold `}>All</button>
              <button 
              onClick={()=>setshowActivity({
                All:false,
                Comments:true,
                History:false
             })}
              className={`${showActivity.Comments?'bg-background text-white':'bg-ticketBtns opacity-80 hover:opacity-100'}  rounded-md py-2 px-3 font-bold `}>Comments</button>
              <button
                          onClick={()=>
                            {setshowActivity({
                            All:false,
                            Comments:false,
                            History:true
                         })
                         FetchTicketHistory()
                        }}
              className={`${showActivity.History?'bg-background text-white':'bg-ticketBtns opacity-80 hover:opacity-100'}  rounded-md py-2 px-3 font-bold `}>History</button>
           </div>
  
           {showActivity.Comments &&
           <div className="flex gap-2 items-center">
            <div className="flex justify-center items-center rounded-full font-bold bg-secondary w-10 h-10 text-xl text-white border-2">
              {user.FirstName.slice(0,1).toUpperCase()}
            </div>
            <input 
            type='text'
            className="p-2 flex-1 bg-primary text-white cursor-text"
            />
           </div>
                  }
           
           
           {showActivity.History && ticket && ticketHistory &&
            <div>
              <div className='flex w-full gap-5 items-center'>
            <span>Filters:-</span>
            <div className='flex gap-3 items-center'>
            
            <select value={specificField} onChange={(e)=>{
              setSpecificField(e.target.value)
            }} className='border-none rounded-md bg-background p-2 text-white font-bold'>
            <option value=''>Specific Field</option>
            <option value='title'>Title</option>  
            <option value='description'>Description</option>
            <option value='status'>Status</option>
            <option value='parent'>Parent</option>
            <option value='children'>Children</option>   
            <option value='estimated Time'>estimated Time</option>         
            <option value='Actual Time'>Actual Time</option>         
            
            </select>

            <select 
            onChange={(e)=>{
              setPerformedBy(e.target.value)
            }}
            className='border-none rounded-md bg-background p-2 text-white font-bold'>
            <option value=''>By Specific User</option>
            {!loadingUsers?
             usersWithProjectAccess && usersWithProjectAccess.length>0 &&
                 usersWithProjectAccess.map((user)=>(
                 <option value={user._id} key={user._id} className='flex w-full border border-red-500 gap-1 items-center text-sm font-bold hover:underline'>
                  {user.FirstName} {user.LastName}
                 </option>
                 ))
                 :
                 <span className='animate-pulse font-bold text-sm flex items-center text-center'>Fetching Users</span>
          }
            </select>
            

            </div>
            </div>
            </div>
            }
  
  
           
           
           
           
            {showActivity.History && ticket && ticketHistory &&
            <IssueHistory scrollHistoryRef={scrollHistoryRef} setShowLoadMore={setShowLoadMore} ticketId={ticket._id} setTicketHistory={setTicketHistory} showLoadMore={showLoadMore} page={page} setPageNumber={setPageNumber} FetchTicketHistory={FetchTicketHistory}  ticketHistory={ticketHistory}/>
            }
  
           
          </div>
  
  
    
     </div>
  
  )
}

export default BasicDetails