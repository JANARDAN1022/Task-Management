import { useEffect, useState } from 'react'
import { Company } from '../../../Types/CompanyType';
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Apiconfig, CompanyBaseApi } from '../../Constants/ApiConstants';
import { IoIosArrowBack } from "react-icons/io";
import { CiSearch } from 'react-icons/ci';
import { unwrapResult } from '@reduxjs/toolkit';
import { ClearStoredCompany, StoreCompany } from '../../../redux/actions/CompanyActions';

const YourCompanies = () => {
    const {user}=useAppSelector(state=>state.user);
    const Navigate = useNavigate();
    const [yourCompanies,setYourCompanies]=useState<Company[] | []>([]);
    const [companyLoading,setCompanyLoading]=useState(false);
    const [search,setSearch]=useState('');
    const [focusedInput,setFocusedInput]=useState(false);
    const dispatch = useAppDispatch();

    // useEffect(()=>{
    //   console.log(companyLoading);
    // },[companyLoading]);
  
  const fetchYourCompanies = async()=>{
    if(user && !companyLoading){
        console.log('calling');
    try {
        const SavedState = localStorage.getItem('companyState');
        if(SavedState){
        await dispatch(ClearStoredCompany());
        }
        setCompanyLoading(true);
        const {data} = await axios.post(`${CompanyBaseApi}/yourCompanies`,{search:search},Apiconfig);
        if(data && data.companies){
            const FetchedYourCompanies = data.companies as Company[];
            setYourCompanies(FetchedYourCompanies);
        }
        setCompanyLoading(false);
    } catch (error) {
        setCompanyLoading(false);
        console.log(error);
    }
}
  }

useEffect(()=>{
    if(user){
    fetchYourCompanies();
    }
},[user,search])


const deleteYourCompany = async(companyId:string)=>{
    if(user && !companyLoading){
    try {
        setCompanyLoading(true);
        const {data} = await axios.post(`${CompanyBaseApi}/yourCompanies/delete`,{companyId:companyId},Apiconfig);
        if(data){
            await fetchYourCompanies();
        }
        setCompanyLoading(false);
    } catch (error) {
        setCompanyLoading(false);
        console.log(error);
    }
}
}

const HandlePrefix = (companyName:string)=>{
    if(companyName){
    return companyName.split(' ').join('').toUpperCase();
    }
  }

const HandleStoreCompany = async(companyID:string,companyName:string)=>{
  
    if(companyID && companyName){
    try {
      const response = await dispatch(
       StoreCompany({companyId:companyID}),
       );
       const result = unwrapResult(response);
       if(result?.success){
        Navigate(`/${HandlePrefix(companyName)}/Projects`);
       }
    } catch (error) {
      console.log(error);
    }
  }
  }

    return (
    <div className='w-screen h-screen flex flex-col items-center bg-background text-white font-bold'>
       <button
       onClick={()=>{
        Navigate('/Company');
       }}
       className='flex opacity-80 absolute left-5 top-3 hover:opacity-100 items-center'>
       <IoIosArrowBack size={30}/>
        <span className='text-lg text-white'>Go Back</span>
       </button>
        <h2 className='text-center p-5 text-xl'>Your Companies</h2>

        <div className='w-full p-2 flex'>
        <div
            className={`max-w-[300px] ${
              focusedInput ? "" : "border-white"
            } border-2 rounded-md text-white p-2 flex items-center justify-between bg-transparent`}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              className="w-[100px] focus:flex-1 bg-transparent
       transition-all duration-500 transform focus:w-[170px]  ease-in-out rounded-md px-2 outline-none placeholder:text-sm  text-base"
              placeholder={`${focusedInput ? "Search Your Company" : "Search Your.."}`}
            />
            <CiSearch size={20} color="white" className="" />
          </div>
        </div>
        { (yourCompanies && yourCompanies.length>0?
        yourCompanies.map((company)=>(
            <div
            key={company._id} className={`${companyLoading?'select-none animate-pulse':''} flex justify-between min-w-full bg-secondary items-center p-5`}>
             <div className='flex flex-col items-start'>
             <button 
             disabled={companyLoading}
             onClick={()=>{
                HandleStoreCompany(company._id,company.name)
             }} className='hover:underline cursor-pointer '> {company.name} 
             </button>
             <span className='text-sm opacity-80 font-light'>Created on : {new Date(company.createdAt).toDateString()}</span>
             </div>
             <button 
             disabled={companyLoading}
             onClick={()=>deleteYourCompany(company._id)} className='bg-red-500 rounded-md opacity-80 hover:opacity-100 py-2 px-4 font-bold'>Delete</button>
            </div>
    
        ))
        :

        <div className='flex flex-col items-center gap-4 w-screen h-screen justify-center'>
            <span>No Companies Found {search?`For ${search}`:''}</span>
            <button
            className='text-white border p-2 bg-secondary rounded-md  opacity-80 hover:opacity-100 font-bold'
            onClick={()=>{
                Navigate('/Company/Create');
            }}>Create New Company</button>
        </div>
            )
        // :
        // <div className='flex min-w-screen h-screen w-screen  flex-col gap-5 items-center justify-center  py-5'>
        //  <h1 className='animate-bounce text-xl font-bold'>Fetching Your Companies ...</h1>
         
        // </div>
    }
    </div>
  )
}

export default YourCompanies