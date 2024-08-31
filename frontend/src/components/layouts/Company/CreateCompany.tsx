import { useCallback, useEffect, useRef, useState } from 'react'
import {  useAppDispatch, useAppSelector } from '../../../Hooks';
import { useNavigate } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import { Apiconfig, CompanyBaseApi } from '../../Constants/ApiConstants';
import { Company } from '../../../Types/CompanyType';
import { StoreCompany } from '../../../redux/actions/CompanyActions';
import { unwrapResult } from '@reduxjs/toolkit';

const CreateCompany = () => {

const {user,error,isAuthenticated,loading} = useAppSelector((state)=>state.user);
const Navigate = useNavigate();
const [Loading,setLoading]=useState(false);
const [loginError,setLoginError]=useState('');
const emailRef =useRef<HTMLInputElement | null>(null);
const dispatch = useAppDispatch();

const CheckUser = useCallback(()=>{
   if(!loading){
    if(!isAuthenticated || !user){
       Navigate('/Login');
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

    const HandlePrefix = (companyName:string)=>{
      if(companyName){
      return companyName.split(' ').join('').toUpperCase();
      }
    }


  return (

    <section className="select-none dark:bg-gray-900 overflow-hidden w-full h-screen min-h-screen">
    <div className="flex flex-col gap-5 items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"> 
    <div className="w-full bg-secondary rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
          Create Your Company
        </h1>

        <Formik
        initialValues={{name:'',description:''}}
        onSubmit={async values => {
          if(values.name){
           try {
            setLoading(true);
            const {data} = await axios.post(`${CompanyBaseApi}/create`,{name:values.name,description:values.description},Apiconfig);
            if(data && data.company){
                const newCompany = data.company as Company;
                const response = await dispatch(
                  StoreCompany({companyId:newCompany._id}),
                  );
                  const result = unwrapResult(response);
                  if(result?.success){
                    Navigate(`/${HandlePrefix(newCompany.name)}/Projects`);
                  }
                setLoading(false);
            }
           } catch (error:any) {
            setLoading(false);
            console.log(error);
           }
          }
        }}
        validationSchema={Yup.object().shape({
            name: Yup.string().required("Required"),
            description: Yup.string(),
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
    values.name='';
    values.description='';
  }
},[error]);

        return (
        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-white  dark:text-white"
            >
              Name Your Company
            </label>
            <input
             disabled={isSubmitting || Loading}
            ref={emailRef}
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              id="name"
              className={`${ errors.name && touched.name ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Ex: CryptoNet"
              required
            />
             {errors.name && touched.name && (
              <div className="text-sm text-red-500 font-bold">{errors.name}{`*`}</div>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-white dark:text-white"
            >
              Description
            </label>
            <input
            disabled={isSubmitting || Loading}
           type="text"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="description"
              placeholder="Ex: CryptoNet is a Great Company which works on....."
              className={`${ errors.description && touched.description ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              autoComplete='off'
            />
 
 {!errors.description && !errors.name && loginError && loginError!='' && (
              <div className="text-sm text-red-500 font-bold">{error}</div>
            )}

             {errors.description && touched.description && (
              <div className="text-sm text-red-500 font-bold">{errors.description}{`*`}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Loading}
            className={`w-full relative text-white opacity-80 ${Loading || isSubmitting ?'':'hover:opacity-100'}  bg-background  font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
          >
           <span className='sm:text-base text-xs'> Create New Company</span>
            <div role="status" className={`${Loading?'':'hidden'} absolute right-2 sm:right-5 top-3 sm:top-2`}>
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
    
         
    </form>
         );
        }}
        </Formik>
       
      </div>
    </div>
  </div>
</section>

  )
}

export default CreateCompany