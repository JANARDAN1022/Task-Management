import axios from "axios";
import {createAsyncThunk,Dispatch } from "@reduxjs/toolkit"; 
import {RegisterData} from '../../Types/UserTypes'

import {
    loginRequest,
    loginSuccess,
    loginFail,
    logoutFail,
    logoutSuccess,
    registerFail,
    registerRequest,
    registerSuccess,
    loadFail,
    loadrequest,
    loadsuccess,
    clearErrors,


} from '../reducers/UserReducer';

const instance = axios.create({
    baseURL:"http://localhost:5000/api/users"   //Api Base Url
});


//Login User
export const LoginUser = createAsyncThunk('user/Login',async(loginData:{Email:string,Password:string},{ dispatch }: { dispatch: Dispatch })=>{
    try {
        dispatch(loginRequest());
        const route = '/login';
        const config = {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        };
        const { data } = await instance.post(route,{Email:loginData.Email,Password:loginData.Password}, config);
        document.cookie = `JWTtoken=${data.JWTtoken}; path=/; secure=true;`;
        dispatch(loginSuccess(data.user));
        return { success: true }; 
    } catch (error:any) {
       dispatch(loginFail(error.response.data.message));
       setTimeout(() => {
        dispatch(clearErrors());
      }, 3000);
    }
});

//Login User With Otp
export const OtpLoginUser = createAsyncThunk('user/OtpLogin',async(otp:Number,{ dispatch }: { dispatch: Dispatch })=>{
  try {
      dispatch(loginRequest());
      const route = '/OTP/validate';
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      };
      const { data } = await instance.post(route,{otp:otp}, config);
      document.cookie = `JWTtoken=${data.JWTtoken}; path=/; secure=true;`;
      dispatch(loginSuccess(data.user));
      return { success: true }; 
  } catch (error:any) {
     dispatch(loginFail(error.response.data.message));
     setTimeout(() => {
      dispatch(clearErrors());
    }, 3000);
  }
});

//Register User
export const RegisterUser = createAsyncThunk('user/register',async(registerData:RegisterData,{ dispatch }: { dispatch: Dispatch })=>{
    try {
        dispatch(registerRequest());
        const route = '/register';
        const config = {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        };
        const { data } = await instance.post(route, registerData, config);
        document.cookie = `JWTtoken=${data.JWTtoken}; path=/; secure=true;`;
        dispatch(registerSuccess(data.user));
        return { success: true }; 
    } catch (error:any) {
      dispatch(registerFail(error.response.data.message));
      setTimeout(() => {
        dispatch(clearErrors());
      }, 5000);

    }
});

//Logout User
export const LogoutUser = createAsyncThunk('user/Logout',async(_,{ dispatch })=>{
    try {
        const route = `/logout`;
        const config =  {headers:{"Content-Type":"application/json"},withCredentials: true};
       // Clearing the JWTtoken cookie  
    document.cookie = 'JWTtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure=true; sameSite=None;'; 
      await instance.post(route,{},config);
        dispatch(logoutSuccess());
        return { success: true }; 
    } catch (error:any) {
        dispatch(logoutFail(error.response.data.message))
        setTimeout(() => {
          dispatch(clearErrors());
        }, 3000);
    }
});


//Load User On Reload
export const Loaduser = createAsyncThunk('user/Load', async (Data:{companyId?:string}, { dispatch }) => {
    try {
      dispatch(loadrequest());
      const route = `/Me`;
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      const { data } = await instance.post(route,Data,config);
      dispatch(loadsuccess(data.user));
    } catch (error:any){
      console.log('failed')
      dispatch(loadFail(error.response.data.message));

      setTimeout(() => {
        dispatch(clearErrors());
      }, 3000);
      console.log(error);
    }
  });

