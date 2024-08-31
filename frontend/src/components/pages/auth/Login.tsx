import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import { LoginUser } from '../../../redux/actions/UserActions';
import { unwrapResult } from '@reduxjs/toolkit';
import axios from 'axios';
import { Apiconfig, UserBaseApi } from '../../Constants/ApiConstants';

const Login = () => {

const {user,error,isAuthenticated,loading} = useAppSelector((state)=>state.user);
const Navigate = useNavigate();
const dispatch = useAppDispatch();
const [Loading,setLoading]=useState(false);
const [loginError,setLoginError]=useState('');
const [loginType,setLoginType]=useState('Password');
const [otpSent,setOtpSent]=useState(false);
const emailRef =useRef<HTMLInputElement | null>(null);

const CheckUser = useCallback(()=>{
   if(user && !loading && isAuthenticated){
    if((user.Role!=='admin' && user.Approved) || user.Role==='admin'){
      const previousPageUrl =  sessionStorage.getItem('prevPath');
      if(previousPageUrl){
    Navigate(previousPageUrl);
    sessionStorage.removeItem('prevPath');
      }else{
        Navigate('/Company');    
      }
    }else{
    Navigate('/Wait-For-Approval')
    }
   }
},[user]);

    useEffect(()=>{
      CheckUser();
    },[CheckUser]);

    useEffect(()=>{
      if(error && error==='Incorrect Email or password'){
        setLoginError(error); 
        setTimeout(() => {
          setLoginError('');
         }, 3000);
      }
    },[error]);


    const HandleSendOTP = async(email:string)=>{
      if(email){
      try {
        setLoginType('OTP');
        setLoading(true);
        const {data} = await axios.post(`${UserBaseApi}/OTP/send`,{email:email},Apiconfig)
         if(data){
            setOtpSent(true);
            console.log(data,'otp sent');
            localStorage.setItem('OtpEmail',email);
            Navigate('/OTP/verify');
         }
      } catch (error) {
        setLoginType('Password');
        setLoading(false);
        localStorage.removeItem('OtpEmail');
        console.log(error);
      }
    }else{
      return;
    }
    }


  return (

    <section className="bg-secondaryBackground select-none dark:bg-gray-900 overflow-hidden w-full h-screen min-h-screen">
    <div className="flex items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
    
    <div className="w-full flex sm:max-w-md min-h-[539px] bg-white rounded-tl-lg rounded-bl-lg shadow dark:border  dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Login In
        </h1>

        <Formik
        initialValues={{Email:'',Password:''}}
        onSubmit={async values => {
          if(values.Email && values.Password){
           try {
            setLoading(true);
             const response = await dispatch(
              LoginUser({Email:values.Email,Password:values.Password})
             );
             const result = unwrapResult(response);
             if(result?.success){
              Navigate("/Company");
             }
             setLoading(false);  
           } catch (error:any) {
            setLoading(false);
            console.log(error);
           }
          }
        }}
        validationSchema={Yup.object().shape({
          Email: Yup.string().email().required("Required"),
          Password: Yup.string().required('Password is required'),
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

useEffect(()=>{
  if(error!=='' && error!==null){
    values.Email='';
    values.Password='';
  }
},[error]);

        return (
        <form className="w-[400px]  space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div className=''>
            <label
              htmlFor="Email"
              className="block mb-2 text-sm font-medium text-gray-900  dark:text-white"
            >
              Your Email
            </label>
            <input
             disabled={isSubmitting || Loading}
            ref={emailRef}
              type="Email"
              name="Email"
              value={values.Email}
              onChange={handleChange}
              onBlur={handleBlur}
              id="Email"
              className={`${ errors.Email && touched.Email ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 min-w-full`}
              placeholder="name@company.com"
              required
            />
             {errors.Email && touched.Email && (
              <div className="text-sm absolute text-red-500 font-bold">{errors.Email}{`*`}</div>
            )}
          </div>
          <div>
            <label
              htmlFor="Password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
            disabled={isSubmitting || Loading || loginType==='OTP'}
           type="Password"
              name="Password"
              value={values.Password}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="Password"
              placeholder="••••••••"
              className={`${ errors.Password && touched.Password ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              required
              autoComplete='off'
            />
 
 {!errors.Password && !errors.Email && loginError && loginError!='' && (
              <div className="text-sm absolute text-red-500 font-bold">{error}</div>
            )}

             {errors.Password && touched.Password && (
              <div className="text-sm absolute text-red-500 font-bold">{errors.Password}{`*`}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Loading || loginType==='OTP'}
            className={`w-full relative text-gray-500 opacity-80 ${Loading || isSubmitting ?'':'hover:bg-green-300 hover:opacity-100'}  bg-green-200  font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
          >
           <span className='sm:text-base text-xs'> Login In With Password</span>
            <div role="status" className={`${Loading && loginType==='Password'?'':'hidden'} absolute right-2 sm:right-5 top-3 sm:top-2`}>
  <svg
    aria-hidden="true"
    className="sm:w-6 sm:h-6 w-5 h-5 text-white  animate-spin dark:text-gray-600 fill-green-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
</div>
          </button>
          <span className='text-center flex items-center justify-center w-full'> OR </span>
          <button
          onClick={()=>{
            if(values.Email){
              HandleSendOTP(values.Email);
            }else{
              if(emailRef && emailRef.current){
                emailRef.current.focus();
              }
            }
          }}
            type="button"
            disabled={isSubmitting || otpSent}
            className={`w-full relative text-gray-500 opacity-80 ${Loading || isSubmitting?'':'hover:bg-green-300 hover:opacity-100'} bg-green-200  font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
          >
           <span className='sm:text-base text-xs'>{otpSent?'OTP Sent':'Login In using OTP'}</span>
            <div role="status" className={`${Loading && loginType==='OTP'?'':'hidden'} absolute right-2 sm:right-5 top-3 sm:top-2`}>
  <svg
    aria-hidden="true"
    className="sm:w-6 sm:h-6 w-5 h-5 text-white  animate-spin dark:text-gray-600 fill-green-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
</div>
          </button>
         
         <Link to='/ForgotPassword' className={`${Loading || isSubmitting?'hidden':''} text-xs sm:text-sm text-gray-500  opacity-70 hover:opacity-100 cursor-pointer`}>
          Forgot password? Click here To Reset!
         </Link>

          <p className={`${Loading || isSubmitting?'hidden':''} text-sm font-light text-gray-500 dark:text-gray-400`}>
            Don't have an account?{" "}
            <Link
              to={ values.Email?`/Register?Email=${values.Email}`:'/Register'}
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Register here
            </Link>
          </p>
        </form>
         );
        }}
        </Formik>
       
      </div>
    </div>

    <div
      className="flex justify-center p-4 min-w-[400px] bg-background mt-6 h-[539px] rounded-tr-md rounded-br-md flex-col items-center mb-6 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white"
    >
      <img
        className="w-[60%] h-[40%]"
        src="/assets/Logo_Green.png"
        alt="logo"
      />
       <span className='italic text-white'>Welcome To</span>
      <span className='italic text-white'>Cryptonet-Internships</span>
    </div>

   

  </div>
</section>

  )
}

export default Login