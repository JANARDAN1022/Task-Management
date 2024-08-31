import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks"
import ProfileInfoCard from "./ProfileInfoCard";
import axios from "axios";
import { Apiconfig, UserBaseApi } from "../../Constants/ApiConstants";
import { Loaduser } from "../../../redux/actions/UserActions";


const Profile = () => {
const {user} = useAppSelector(state=>state.user);
const dispatch = useAppDispatch();
const [loading,setLoading]=useState(false);
const [formData,setFormData] = useState({
    FirstName:'',
    LastName:'',
    Email:'',
    role:'',
    AadhaarNumber:'',
    MobileNumber:'',    
});

useEffect(()=>{
    if(user){
        setFormData({
            FirstName:user.FirstName,
            AadhaarNumber:user.AadhaarNumber.toString(),
            Email:user.Email,
            LastName:user.LastName,
            MobileNumber:user.MobileNumber.toString(),
            role:user.Role
        })
    }
},[user]);

const HandleBlur = async(Field:string)=>{
    if(Field && user && !loading){
        setLoading(true);
    const updateData = {
    FirstName:'',
    LastName:'',
    Email:'',
    role:'',
    AadhaarNumber:user.AadhaarNumber,
    MobileNumber:Number(user.MobileNumber),  
}

if(Field==='FirstName' && formData.FirstName){
   updateData.FirstName = formData.FirstName;
}

if(Field==='LastName' && formData.LastName){
    updateData.LastName = formData.LastName;
 }

 if(Field==='AadhaarNumber' && formData.AadhaarNumber){
    updateData.AadhaarNumber = Number(formData.AadhaarNumber);
 }

 if(Field==='MobileNumber' && formData.MobileNumber){
    updateData.MobileNumber = Number(formData.MobileNumber);
 }
    
try {
    console.log('data used :-',updateData);
    const {data} = await axios.post(`${UserBaseApi}/update`,updateData,Apiconfig);
    
    if(data){
        console.log('newUser:-',data);
       await dispatch(Loaduser())
    }
    setLoading(false);
    } catch (error) {
        setLoading(false);
        console.log(error);
    }
    setLoading(false);
    }
}

    return (
    user ?
    <div className="flex flex-col p-10 items-center h-[100vh]">
  <div className="relative flex flex-col items-center rounded-[20px] w-[95%] max-w-[95%] mx-auto  bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:!shadow-none p-3">
    <div className="mt-2 mb-8 w-full">
      <h4 className="px-2 text-2xl underline font-bold text-white">
        Account Information
      </h4>
    </div>
    <div className="grid grid-cols-2 gap-4 px-2 w-full">
      <ProfileInfoCard
      disabled={loading}
      onBlur={()=>{
        if(formData.FirstName!==user.FirstName){
            HandleBlur('FirstName');
        }
      }}
      displaySaveButton={formData.FirstName===user.FirstName?false:true} 
      Head="First Name"
      onChange={(e:any)=>setFormData({...formData,FirstName:e.target.value})}
      type="text"
      value={formData.FirstName}
      />
       <ProfileInfoCard
       disabled={loading}
      onBlur={()=>{
        if(formData.LastName!==user.LastName){
            HandleBlur('LastName');
        }
      }}
       displaySaveButton={formData.LastName===user.LastName?false:true} 
      Head="Last Name"
       onChange={(e:any)=>setFormData({...formData,LastName:e.target.value})} 
      type="text"
      value={formData.LastName}
      />
       <ProfileInfoCard
       disabled={loading}
      onBlur={()=>{
        if(Number(formData.AadhaarNumber)!==user.AadhaarNumber){
            HandleBlur('AadhaarNumber');
        }
      }}
       displaySaveButton={Number(formData.AadhaarNumber)===user.AadhaarNumber?false:true} 
      Head="Aadhaar Number"
       onChange={(e:any)=>setFormData({...formData,AadhaarNumber:e.target.value})} 
      type="number"
      value={formData.AadhaarNumber}
      />
       <ProfileInfoCard
       disabled={loading}
      onBlur={()=>{
        if(Number(formData.MobileNumber)!==user.MobileNumber){
            HandleBlur('MobileNumber');
        }
      }}
       displaySaveButton={Number(formData.MobileNumber)===user.MobileNumber?false:true} 
      Head="Mobile Number"
       onChange={(e:any)=>setFormData({...formData,MobileNumber:e.target.value})} 
      type="number"
      value={formData.MobileNumber}
      />
      <ProfileInfoCard
      disabled={loading}
      onBlur={()=>{
        if(formData.Email!==user.Email){
            HandleBlur('Email');
        }
      }}
      displaySaveButton={formData.Email===user.Email?false:true} 
      Head="Email"
       onChange={(e:any)=>setFormData({...formData,Email:e.target.value})} 
      type="email"
      value={formData.Email}
      />
     <div className="flex flex-col justify-center rounded-2xl bg-secondary bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
    <h1 className="text-sm text-white font-bold">Role :</h1>
    <p 
    className="text-base outline-none font-medium text-white">
        {user.Role}
    </p>
  </div>
    </div>
  </div>
</div>


    :

    <div>No user Please Log In</div>
  )
}

export default Profile