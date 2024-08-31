import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import { RegisterUser } from '../../../redux/actions/UserActions';
import { unwrapResult } from '@reduxjs/toolkit';
import { FaEyeSlash,FaEye  } from "react-icons/fa";
import { ClearStoredProject } from '../../../redux/actions/ProjectActions';

const Register = () => {
    const {user,error} = useAppSelector((state)=>state.user);
const Navigate = useNavigate();
const dispatch = useAppDispatch();
const [Loading,setLoading]=useState(false);
const [ShowPassword,SetShowPassword] = useState(false);
const CheckUser = useCallback(()=>{
  dispatch(ClearStoredProject());
   if(user){

    if((user.Role!=='admin' && user.Approved) || user.Role==='admin'){
    Navigate('/Projects');
    }else{
    Navigate('/Wait-For-Approval')
    }
   }
},[user]);

    useEffect(()=>{
      CheckUser();
    },[CheckUser]);
    

  return (

    <section className="bg-secondaryBackground select-none dark:bg-gray-900 overflow-hidden h-screen w-full min-h-screen">
    <div className="flex   items-center justify-center md:px-6  md:py-8 mx-auto md:h-full lg:py-0">
    
      <div className="w-full sm:min-w-[600px] fixed bottom-0 sm:static  h-max bg-white rounded-tl-lg rounded-bl-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-3 space-y-2 md:space-y-0 sm:p-4">
          <h1 className="text-base font-bold leading-tight tracking-tight text-gray-900 md:text-lg dark:text-white">
            Create Your account
          </h1>

          <Formik 
          initialValues={{
            FirstName:'',
            LastName:'',
            Email:'',
            Password:'',
            ConfirmPassword:'',
            AadhaarNumber:'',
            MobileNumber:'',

          }}
          
          onSubmit={async values => {
            if(values.Email && values.Password && values.ConfirmPassword && values.FirstName && values.LastName  && (values.Password===values.ConfirmPassword && values.AadhaarNumber && values.MobileNumber)){
              try {
                setLoading(true);
                 const response = await dispatch(
                  RegisterUser({MobileNumber:Number(values.MobileNumber),AadhaarNumber:Number(values.AadhaarNumber),FirstName:values.FirstName,LastName:values.LastName,ConfirmPassword:values.ConfirmPassword,Email:values.Email,Password:values.Password})
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
            FirstName: Yup.string().required('First Name is required'),
            LastName: Yup.string().required('Last Name is required'),
            Email: Yup.string().email('Invalid email address').required('Email is required'),
            Password: Yup.string().required('Password is required')
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
              "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )
            ,
            ConfirmPassword: Yup.string().required('Please Confirm Your Password ').oneOf([Yup.ref('Password')], 'Passwords must match'),
            AadhaarNumber: Yup.number().typeError('Enter a Valid Number').required('Please provide You Aadhar Number'),
            MobileNumber: Yup.number().typeError('Enter a Valid Number').required('Mobile Number Required'),
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
          <form className="space-y-1" onSubmit={handleSubmit}>
          
          <div className='flex gap-2 w-full min-w-full sm:justify-around'>

          <div className='w-full relative'>
              <label
                htmlFor="FirstName"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                First Name
              </label>
              <input
                type="FirstName"
                name="FirstName"
                id="FirstName"
                value={values.FirstName}
                onChange={handleChange}
              onBlur={handleBlur}
                className={`${ errors.FirstName && touched.FirstName ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="john"
                required
                disabled={Loading}
              />
               {errors.FirstName && touched.FirstName && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 right-2">{errors.FirstName}{`*`}</div>
            )}
            </div>

            <div className='w-full relative'>
              <label
                htmlFor="LastName"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Last Name
              </label>
              <input
                type="LastName"
                name="LastName"
                id="LastName"
                value={values.LastName}
                onChange={handleChange}
              onBlur={handleBlur}
                className={`${ errors.LastName && touched.LastName ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="Doe"
                required
                disabled={Loading}
              />
               {errors.LastName && touched.LastName && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 right-2">{errors.LastName}{`*`}</div>
            )}
            </div>

              </div>

            <div className='relative'>
              <label
                htmlFor="Email"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Your Email
              </label>
              <input
                type="Email"
                name="Email"
                id="Email"
                value={values.Email}
                onChange={handleChange}
              onBlur={handleBlur}
                className={`${ errors.Email && touched.Email ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="name@company.com"
                required
                disabled={Loading}
              />
               {errors.Email && touched.Email && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 right-2">{errors.Email}{`*`}</div>
            )}
            </div>
            <div className='relative'>
              <label
                htmlFor="Password"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type={ShowPassword? 'text':'password'}
                name="Password"
                id="Password"
                value={values.Password}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="••••••••"
                className={`${ errors.Password && touched.Password ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
                autoComplete='off'
              />
              {ShowPassword?
              <FaEye onClick={()=>SetShowPassword(false)} size={20} className='cursor-pointer opacity-70 hover:opacity-100 absolute right-8 top-10'/>
             :
              <FaEyeSlash onClick={()=>SetShowPassword(true)} size={20} className='cursor-pointer opacity-70 hover:opacity-100 absolute right-8 top-10'/>
              }
               {errors.Password && touched.Password && (
              <div className="text-[10px] text-red-500 font-bold absolute top-1 right-0">{errors.Password}{`*`}</div>
            )}
            </div>
            <div className='relative'>
              <label
                htmlFor="ConfirmPassword"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm password
              </label>
              <input
                type="ConfirmPassword"
                name="ConfirmPassword"
                id="ConfirmPassword"
                value={values.ConfirmPassword}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="••••••••"
                className={`${ errors.ConfirmPassword && touched.ConfirmPassword ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
                autoComplete='off'
              />
               {errors.ConfirmPassword && touched.ConfirmPassword && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 right-2">{errors.ConfirmPassword}{`*`}</div>
            )}
            </div>
            <div className='flex justify-around w-full items-center'>
            {/* <div className="flex items-start w-full">
  <div className="ml-3 text-sm relative">
    <label htmlFor="role" className={` text-gray-900 font-medium dark:text-gray-300`}>
      Select your Role:
    </label>
    <select
      id="role"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.role}
      name="role"
      className={`${ errors.role && touched.role ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} block w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:ring-primary-300 focus:border-primary-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800`}
      required
      disabled={Loading}
    >
      <option value="">Select</option>
      <option value="intern">Intern</option>
      <option value="manager">Manager</option>
    </select>
    {errors.role && touched.role && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-8 right-[-110%]">{errors.role}{`*`}</div>
            )}
  </div>
</div> */}
             <div className='w-full relative'>
              <label
                htmlFor="MobileNumber"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                pattern='[0-9]*'
                minLength={10}
                maxLength={10}
                name="MobileNumber"
                id="MobileNumber"
                value={values.MobileNumber}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="Your Contact Info"
                className={`${ errors.MobileNumber && touched.MobileNumber ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
              />
               {errors.MobileNumber && touched.MobileNumber && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 right-0">{errors.MobileNumber}{`*`}</div>
            )}
            </div>
            </div>


        <div className='relative'>
              <label
                htmlFor="AadhaarNumber"
                className="block mb-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white"
              >
             AadharCard-Number
              </label>
              <input
                type="tel"
                pattern='[0-9]*'
                maxLength={12}
                minLength={12}
                name="AadhaarNumber"
                id="AadhaarNumber"
                value={values.AadhaarNumber}
                onChange={handleChange}
              onBlur={handleBlur}
                placeholder="Your AadharCard Number"
                className={`${ errors.AadhaarNumber && touched.AadhaarNumber ? "border-red-500 outline-red-500":'outline-green-500 border-green-500'} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-1 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                required
                disabled={Loading}
              />
               {errors.AadhaarNumber && touched.AadhaarNumber && (
              <div className="text-[10px] sm:text-xs md:text-sm text-red-500 font-bold absolute top-0 left-[30%]">{errors.AadhaarNumber}{`*`}</div>
            )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-gray-500 relative opacity-80 hover:bg-green-300 hover:opacity-100 bg-green-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
             <span> Create your account </span>
             <div role="status" className={`${Loading?'':'hidden'} absolute right-10 sm:right-36 md:right-44 top-2`}>
  <svg
    aria-hidden="true"
    className="w-6 h-6 text-white  animate-spin dark:text-gray-600 fill-green-600"
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
            <div className='w-full flex  items-center'>
            <p className="text-sm font-light  min-w-[260px] text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/Login"
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Login here
              </Link>
            </p>
            {error &&
            <span className='justify-self-center flex text-sm text-red-500 font-bold absolute top-0 right-2'>{error}*</span>
            }
            </div>
          </form>
          );
        }}
          </Formik>
        </div>
      </div>

      <div
      className="flex justify-center p-4 min-w-[400px] bg-background mt-6 h-[567px] rounded-tr-md rounded-br-md flex-col items-center mb-6 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white"
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

export default Register