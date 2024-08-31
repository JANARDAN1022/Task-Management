import axios from "axios";
import { Link, useNavigate } from "react-router-dom"
import { Apiconfig, UserBaseApi } from "../../Constants/ApiConstants";
import * as Yup from "yup";
import { Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { MdMarkEmailRead } from "react-icons/md";
import { useAppSelector } from "../../../Hooks";
import { SiMinutemailer } from "react-icons/si";

const ForgotPassword = () => {
    const [emailSent,setEmailSent]=useState(false);
    const [sendingMail,setSendingMail]=useState(false);
    const [tokenExpires,setTokenExpires]=useState(30);
    const {user,loading,isAuthenticated} = useAppSelector(state=>state.user)
    const Navigate = useNavigate();

    
useEffect(()=>{
    if(tokenExpires>0 && emailSent){
      setTokenExpires(tokenExpires-1);
     }
},[tokenExpires]);

const CheckUser = useCallback(()=>{
    if(user && !loading && isAuthenticated){
     if((user.Role!=='admin' && user.Approved) || user.Role==='admin'){
       const previousPageUrl =  sessionStorage.getItem('prevPath');
       if(previousPageUrl){
     Navigate(previousPageUrl);
     sessionStorage.removeItem('prevPath');
       }else{
         Navigate('/Projects');    
       }
     }else{
     Navigate('/Wait-For-Approval')
     }
    }
 },[user]);
 
     useEffect(()=>{
       CheckUser();
     },[CheckUser]);
    

    const HandleResetPassword = async(email:string)=>{
        if(email){
        try {
          setSendingMail(true);
            const {data} = await axios.post(`${UserBaseApi}/password/forgot`,{Email:email},Apiconfig)
             if(data){
                setEmailSent(true);
                console.log(data,'password data is');
             }
             setSendingMail(false);
        } catch (error) {
          setSendingMail(false);
            console.log(error);
        }
    }else{
        
    }
    }

    return (
        <div className="h-screen w-screen flex justify-center items-center">
    <div className="max-w-lg w-full mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300">
  <h1 className="text-4xl font-medium">Reset password</h1>
  <p className="text-slate-500">Fill up the form to reset the password</p>

   <Formik
   initialValues={{email:''}}
   onSubmit={async values => 
    await HandleResetPassword(values.email)}
    validationSchema={Yup.object().shape({
        email: Yup.string().email().required("Required"),
        
      })
    }
   >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
           
        return (

   
  <form action="" className="my-10" onSubmit={handleSubmit}>
    <div className="flex flex-col space-y-5">
      <label htmlFor="email">
        <p className="font-medium text-slate-700 pb-2">Email address</p>
        <input
        disabled={isSubmitting}
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
          id="email"
          name="email"
          type="email"
          className={`${ errors.email && touched.email ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
          placeholder="Enter email address"
          required
        />
      </label>
      <button 
      type="submit"
      disabled={isSubmitting || emailSent}
      className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
      
        <span className={`${sendingMail?'animate-pulse':''}`}>{emailSent?'Email Sent':sendingMail?'Sending Email pls wait':'Send Email'}</span>
        <SiMinutemailer className={`${emailSent?'hidden':''} ${sendingMail?'animate-bounce':''} text-[20px] text-white `}/>
        <MdMarkEmailRead className={`${emailSent?'':'hidden'} text-[20px] text-white `}/>
      </button>
      <p className={`${emailSent || sendingMail?'hidden':''} text-center`}>
        Not registered yet?{" "}
        <Link
          to="/Register"
          className={` opacity-80 hover:opacity-100 hover:underline text-indigo-600 font-medium inline-flex space-x-1 items-center`}
        >
          <span>Register now </span>
         
        </Link>
      </p>

      {emailSent &&
      <div className="flex flex-col justify-center items-center gap-2">
      <p className="text-sm  text-green-500">if you Do Not see the email pls wait it might take a min or check spam</p>
      <span className="text-blue-500">OR</span>
      <button 
      onClick={()=>{
        setEmailSent(false);
        HandleResetPassword(values.email);
      }}
      disabled={isSubmitting || sendingMail}
      type="button"  className="text-green-500 opacity-80 hover:opacity-100 hover:underline font-bold">Retry & Resend Email</button>
      </div>
      }
    </div>
  </form>
        )
    }}
  </Formik>
</div>
</div>
  )
}

export default ForgotPassword

