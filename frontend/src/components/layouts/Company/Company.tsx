import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks"
import { useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { LogoutUser } from "../../../redux/actions/UserActions";
import axios from "axios";
import { Apiconfig, CompanyBaseApi } from "../../Constants/ApiConstants";
import { ClearStoredCompany } from "../../../redux/actions/CompanyActions";

const Company = () => {
    const {user,loading,isAuthenticated} = useAppSelector(state=>state.user);
    const [yourCompaniesExist,setYourCompaniesExust]=useState(false);
    
    const Navigate = useNavigate();
    const dispatch = useAppDispatch();

    const CheckUser = useCallback(()=>{
        if(!loading){
          if(!user || !isAuthenticated){
            Navigate('/Login');
          }
        }
     },[user]);
     
         useEffect(()=>{
           CheckUser();
         },[CheckUser]);

    const FetchYourCompaniesExist = async()=>{
         try {
          const SavedState = localStorage.getItem('companyState');
          if(SavedState){
          await dispatch(ClearStoredCompany());
          }
            const {data} = await axios.post(`${CompanyBaseApi}/yourCompanies`,{},Apiconfig);
            if(data){
               if(data.yourCompaniesExist){
                setYourCompaniesExust(true);
               }else{
                  setYourCompaniesExust(false);
               }
            }
         } catch (error) {
            console.log(error)
         }
    }

    useEffect(()=>{
        if(user){
        FetchYourCompaniesExist();
        }
    },[user]);



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
    <div className='w-screen h-screen flex justify-center items-center'>
        
     {user?
     <div className='relative w-full min-w-[200px] shadow-md select-none shadow-primary max-w-lg text-white font-bold flex flex-col justify-center gap-5 items-center bg-secondary rounded-md min-h-[400px]'>
     <span className="absolute top-2 left-5  underline">Welcome {user.FirstName}</span>
      {user &&
       <button onClick={HandleLogout} className="absolute top-2 right-5 opacity-80 hover:opacity-100 hover:underline">Logout</button>
      }
       <div className="flex flex-col gap-2 items-center w-full">
        {user &&  yourCompaniesExist &&
       <button 
       onClick={()=>Navigate('/YourCompanies')}
       className="min-w-[400px] py-2 px-6 opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out bg-background rounded-md">Your Companies</button>
           }
       <button 
       onClick={()=>Navigate('/Company/Create')}
       className="min-w-[400px] py-2 px-6 opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out bg-background rounded-md">Create New Company</button>
       </div>
         
         <span className="text-lg">OR</span>

         <div className="flex flex-col gap-2 items-center">
         {user && user.companies.length>0 &&
       <button 
       onClick={()=>Navigate('/JoinedCompanies')}
       className="min-w-[400px] py-2 px-6 opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out bg-background rounded-md">Companies you Joined</button>
           }
         <button 
         onClick={()=>Navigate('/Company/Join')}
         className="py-2 px-6 min-w-[400px] opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out bg-background rounded-md">Join a Company</button>
       </div>

     </div>
     
     :

       <div className='relative w-full min-w-[200px] shadow-md select-none shadow-green-800 max-w-lg text-white font-bold flex flex-col justify-center gap-5 items-center bg-green-700 rounded-md min-h-[400px] animate-pulse' />
    }
    </div>
  )
}

export default Company