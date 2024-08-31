import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom"
import { Apiconfig, UserBaseApi } from "../../Constants/ApiConstants";
import * as Yup from "yup";
import { Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAppSelector } from "../../../Hooks";
import { User } from "../../../Types/UserTypes";

const ResetPassword = () => {
    const [passwordChanged,setPasswordChanged]=useState(false);
    const [ShowPassword,SetShowPassword] = useState(false);
    const [Loading,setLoading]=useState(false);
    const [userExists,setUserExists]=useState<User | null>(null);
   
const {token} = useParams();
const Navigate = useNavigate();
const {user,loading,isAuthenticated} = useAppSelector(state=>state.user);



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

// useEffect(()=>{
//     console.log(token,Loading);
// },[Loading,token]);

const ValidateToken = async()=>{
  if(token){
  try {
    setLoading(true);
    const {data} = await axios.post(`${UserBaseApi}/password/token/validate`,{Token:token},Apiconfig);
    if(data && data.success){
      const TokenUser = data.user as User;
      if(TokenUser){
        setUserExists(TokenUser);
      }
    }
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
 }
}

useEffect(()=>{
  if(token && !userExists){ 
  ValidateToken();
  }
},[userExists]);

    const HandleResetPassword = async(password:string,confirmPassword:string)=>{
        console.log('reached here');
        if(password && confirmPassword && token && !passwordChanged){
        try {
            setLoading(true);
            console.log('loading set true');
            const {data} = await axios.post(`${UserBaseApi}/password/reset`,{Token:token,Password:password,ConfirmPassword:confirmPassword},Apiconfig)
             if(data){
                console.log('data recieved');
                setPasswordChanged(true);
                console.log(data,'Reset password data is');
             }
             setLoading(false);
        } catch (error) {
            console.log('error');
            setLoading(false);
            console.log(error);
        }
    }else if(passwordChanged){
        console.log('password changed going ro login');
        Navigate('/Login');
    }
    }

    return (
        <div className="h-screen w-screen flex justify-center items-center">
  
    {userExists && !Loading?
    <div className="max-w-lg w-full mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300">
  <h1 className="text-4xl font-medium">{passwordChanged?'Password Changed Successfully':'Reset password'}</h1>
  <p className={`${passwordChanged?'hidden':''} text-slate-500`}>Enter New Password</p>

   <Formik
   initialValues={{password:'',confirmPassword:''}}
   onSubmit={async values => {
    if(values.password && values.confirmPassword && (values.password===values.confirmPassword)){
    await HandleResetPassword(values.password,values.confirmPassword)
    }
}}
    validationSchema={Yup.object().shape({
        password: Yup.string().required('Password is required')
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
              "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )
            ,
        confirmPassword: Yup.string().required('Please Confirm Your Password ').oneOf([Yup.ref('password')], 'Passwords must match'),
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

   !passwordChanged?
  <form action="" className="my-10" onSubmit={handleSubmit}>
    <div className={`relative`}>
              <label
                htmlFor="Password"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type={ShowPassword? 'text':'password'}
                name="password"
                id="password"
                value={values.password}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="••••••••"
                className={`${ errors.password && touched.password ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
                autoComplete='off'
              />
              {ShowPassword?
              <FaEye onClick={()=>SetShowPassword(false)} size={20} className='cursor-pointer opacity-70 hover:opacity-100 absolute right-8 top-10'/>
             :
              <FaEyeSlash onClick={()=>SetShowPassword(true)} size={20} className='cursor-pointer opacity-70 hover:opacity-100 absolute right-8 top-10'/>
              }
               {errors.password && touched.password && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold">{errors.password}{`*`}</div>
            )}
            </div>
            <div className={``}>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm password
              </label>
              <input
                type="text"
                name="confirmPassword"
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="••••••••"
                className={`${ errors.confirmPassword && touched.confirmPassword ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
                autoComplete='off'
              />
               {errors.confirmPassword && touched.confirmPassword && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold">{errors.confirmPassword}{`*`}</div>
            )}
            </div>
      <button 
      type="submit"
      disabled={isSubmitting}
      className="w-full mt-3 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
        <span>{passwordChanged?'Password Changed Log In':'Change Password'}</span>
      </button>
  </form>
  :

  <Link 
  to={'/Login'}
  className="w-full mt-3 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
    <span>{passwordChanged?'Password Changed Log In':'Change Password'}</span>
  </Link>
        )
    }}
  </Formik>
</div>
:!userExists && Loading?
<div className="max-w-lg w-full mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300 animate-pulse" />
:!userExists && !Loading?
<div className="max-w-lg w-full flex flex-col gap-2 items-center justify-center mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300 font-bold">
<span className="text-red-500">Token has Expired Please Request a New One</span>
<Link to={'/ForgotPassword'} className="hover:underline opacity-80 hover:opacity-100 text-blue-500" >Forgot Password</Link>
</div>
:
<div className="max-w-lg w-full mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300 animate-pulse" />
}
</div>
  )
}

export default ResetPassword

