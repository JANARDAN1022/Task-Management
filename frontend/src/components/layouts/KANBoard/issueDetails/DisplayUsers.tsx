import { useAppSelector } from "../../../../Hooks"
import { User } from "../../../../Types/UserTypes"

type DisplayUsersProps = {
    usersAvailable:User[]
    LoadingUsers:boolean
    HandleUpdateTicket: (status?: string, Newparent?: string, Children?: string, estimatedTime?: string, loggedTime?: string, childrenIdRemoved?: string, removeParent?: boolean, assignedTo?: string, assignedby?: string) => Promise<void>
    displayAssignTo?:boolean
    displayAssignBy?:boolean
}

const DisplayUsers = ({usersAvailable,LoadingUsers,HandleUpdateTicket,displayAssignTo,displayAssignBy}:DisplayUsersProps) => {
  const {user} = useAppSelector((state)=>state.user);
  return (
    user &&
    <div className="flex absolute right-8  flex-col min-h-[100px]  top-6 min-w-[140px] w-max bg-secondary  rounded-md shadow-md z-[999]">
     {!LoadingUsers?
        usersAvailable  && usersAvailable.length>0?
         usersAvailable.map((User)=>(
          <span onClick={async()=>{
            if(displayAssignTo){
            await HandleUpdateTicket('','','','','','',undefined,User._id);
            }else if(displayAssignBy){
              await HandleUpdateTicket('','','','','','',undefined,'',User._id);   
            }  
        }} className="p-2 w-full cursor-pointer rounded-tl-md rounded-tr-md text-center hover:bg-primary" key={User._id}>{User._id===user._id?(displayAssignBy?'Select YourSelf':'Assign To YourSelf'): User.FirstName}</span>
         ))
        :
        <span>No Users Found </span>
     :
     <span className="animate-pulse text-center">Fetching users</span>
     }
    </div>
  )
}

export default DisplayUsers