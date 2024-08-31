import {useState } from 'react';
import {TicketHistoryType } from '../../../../Types/HistoryType';
import { Apiconfig, HistoryBaseApi } from '../../../Constants/ApiConstants';
import axios from 'axios';

type IssueHistoryProps = {
  page:number
  setPageNumber: React.Dispatch<React.SetStateAction<number>>
    ticketHistory: TicketHistoryType[];
    FetchTicketHistory: () => Promise<void>
    showLoadMore:boolean
    setTicketHistory: React.Dispatch<React.SetStateAction<TicketHistoryType[]>>
    ticketId:string
    setShowLoadMore: React.Dispatch<React.SetStateAction<boolean>>
    scrollHistoryRef: React.RefObject<HTMLDivElement>
}

const IssueHistory = ({setShowLoadMore,ticketId,setTicketHistory,showLoadMore,ticketHistory,page,setPageNumber,scrollHistoryRef}:IssueHistoryProps) => {
 
const [Loading,setLoading]=useState(false);

const FetchNewHistory = async()=>{
if(page>0 && ticketId && !Loading){
  try {
    setLoading(true);
    setPageNumber(page + 1);
    const Route = ` ${HistoryBaseApi}/ticket/specific`;
    const Body:{
      ticketId:string,
      page:number
    } = {
      ticketId:ticketId,
      page:page + 1
    }
    const {data} = await axios.post(Route,Body,Apiconfig);
    if(data && data.TicketHistory){
         console.log(data);
         console.log(ticketHistory,'ticket history here',data.ticketHistory,'new history');
         setTicketHistory(prevTicketHistory => [...prevTicketHistory, ...data.TicketHistory]); // Concatenating arrays
       setShowLoadMore(data.hasNextPage);
      }else{
        console.log('no data history ticket');
    }
    setLoading(false);
} catch (error) {
    console.log(error);
    setLoading(false);
}
}
}

//console.log(ticketHistory);


  return (
    <div ref={scrollHistoryRef} className='w-full bg-secondary text-white flex flex-col gap-2 items-center  overflow-y-auto px-4 py-6'>
    {ticketHistory && ticketHistory.length>0?
     ticketHistory.map((history)=>(
        <div key={history._id + history.createdAt} className='flex flex-col gap-2 w-full p-2'>
        <div className='flex items-center gap-2'>
        <span className='flex w-10 h-10 items-center justify-center text-center font-bold rounded-full bg-background'>
            {history.performedBy?.FirstName.slice(0,1).toUpperCase()}
        </span>
        <span className=''>
          Ticket {history.eventItemId?.ticketName}{history.updatedField && "'s"} <strong className={`font-bold ${history.action==='Restored'?'text-yellow-500':history.action==='Deleted'?'text-red-500':'text-blue-700'}`}>{history.updatedField?.toUpperCase()} {history.action}</strong>  
          {' '}
          by {' '} {history.performedBy?.FirstName} {history.performedBy?.LastName} on
          </span>
        <span>{new Date(history.createdAt).toLocaleString()}</span>
        </div>
        
          <div className='flex gap-2 items-center'>
              {history.changes && history.changes.oldValue && Object.keys(history.changes.oldValue || {}).map((field) => (
                history.changes.oldValue &&
                <div className='flex gap-2 items-center' key={history._id + history.updatedAt + history.createdAt}>
                  <span className='bg-red-500 py-1 px-2 rounded-md'>{history.changes?.oldValue[field]?history.changes.oldValue[field]:'NONE'}</span>
                  <span>{`--->`}</span>
                  <span className='bg-blue-500 py-1 px-2 rounded-md'>{history.changes?.newValue[field]?history.changes.newValue[field]:'NONE'}</span>
                 </div>
              ))}
            </div>

            

        </div>
     )) 
     :
     
     <div className='flex flex-col gap-2 items-center'>
     <span>No History Found </span> 
    </div>
}

{showLoadMore &&
<button
onClick={async()=>{
  if(!Loading){
    await FetchNewHistory()
  }
}}
className='hover:underline hover:opacity-100 opacity-80 font-bold text-white'>Load More</button>
} 
</div>
  )
}

export default IssueHistory