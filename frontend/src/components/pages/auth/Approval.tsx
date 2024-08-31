import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { Link, useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { LogoutUser } from '../../../redux/actions/UserActions';
import { FcManager } from "react-icons/fc";
import { SiGoogletagmanager } from "react-icons/si";
import { MdAdminPanelSettings } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { ClearStoredProject } from '../../../redux/actions/ProjectActions';

const Approval = () => {
    const {user} = useAppSelector((state)=>state.user);
    const dispatch = useAppDispatch();
const Navigate = useNavigate();
const ApprovedBy = user?.AppliedRole==='intern'? 'Manager':'Admin';
const CheckUser = useCallback(()=>{
  dispatch(ClearStoredProject());
   if(user){
    if((user.Role!=='admin' && user.Approved) || user.Role==='admin'){
    Navigate('/Projects');
    }
   }else{
    Navigate('/login');
   }
},[user]);

    useEffect(()=>{
      CheckUser();
    },[CheckUser]);

    const HandleLogout = async()=>{
      try {
       const response = await  dispatch(LogoutUser());
       const result = unwrapResult(response);
                   if(result?.success){
                    Navigate("/Login");
                   }
      } catch (error) {
        console.log(error);
      }
   }


  return (
    <div className={`w-full h-screen ${user?'flex-col md:flex-row gap-10':'flex-col'} flex  justify-center items-center bg-green-200`}>
       <div
      className="flex  sm:flex-col items-center sm:mb-6 text-lg  lg:text-2xl font-semibold text-gray-900 dark:text-white"
    >
      <img
        className="w-14 h-14 lg:w-24 lg:h-24 mr-2"
        src="/assets/Logo_Green.png"
        alt="logo"
      />
      <span className='italic'>Cryptonet-Internships</span>
    </div>
      {user?
      <div className='w-full flex flex-col gap-2 sm:gap-5 md:max-w-[600px] min-h-[500px] shadow-lg text-white bg-green-500 rounded-md'>
      <nav className='flex p-2 justify-between text-white font-bold items-center w-full border-b-black border-b'>
         <span>Hey {user.FirstName} {user.LastName}!</span>
         <button disabled={!user} className='p-2 hover:underline cursor-pointer rounded-md font-bold opacity-70 hover:opacity-100' onClick={HandleLogout}>Logout</button>  
      </nav>
     <span className='text-center sm:text-base text-sm font-bold underline'> Waiting For {ApprovedBy}s Approval !!!</span>
      <p className='flex p-4 flex-wrap text-base sm:text-lg font-semibold'>
      hey {user.FirstName} Thanks For Deciding To Join CryptoNet Internships But 
      before you can continue the {ApprovedBy} will Approve Your 
      joining Request to confirm your Role so Please Wait
      While {ApprovedBy} Approves Your Request to Join, 
      your request has been recieved by the {ApprovedBy} and will Soon Take some action on it!. 
      </p>

<div className='w-full flex flex-col justify-center items-center'>
 {user.AppliedRole==='intern'?
  <div className='flex  gap-1  w-max items-center'>
        <FcManager size={50} />
        <div className='animate-spin flex justify-center items-center'>
        <SiGoogletagmanager size={30}/>
        </div>
  </div>
:
<div className='flex  items-center'>
  <RiAdminFill color='black' size={50}/>
<img
className="animate-bounce w-20 h-20 mr-2"
src="/assets/Logo_Green.png"
alt="logo"
/>
</div>
}
  <span className='flex gap-1 items-center'>Waiting For Approval {user.Role==='intern' && <MdAdminPanelSettings size={30}/>}</span>
</div>

     </div>
     :
     <Link to='/Login' className='text-lg text-blue-500 opacity-70 hover:underline hover:opacity-100'>Please Log in To Continue!</Link>
}
    </div>
  )
}

export default Approval