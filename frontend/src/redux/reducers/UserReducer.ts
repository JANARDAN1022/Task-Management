import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {User,UsersState}  from '../../Types/UserTypes';


const initialState:UsersState ={
    loading: false,
    isAuthenticated: false,
    user:null,
}

const Req = (state:UsersState)=>{
    state.loading=true;
    state.isAuthenticated=false;
}

const Success = (state:UsersState,action:PayloadAction<User>)=>{
    state.loading=false;
    state.isAuthenticated=true;
    state.user= action.payload;
}

const Fail = (state:UsersState,action:PayloadAction<string>)=>{
    state.loading=false;
    state.isAuthenticated=false;
    state.user=null;
    state.error=action.payload;
}


const ClearErrors = (state:UsersState)=>{
    state.error=null;
}

const UserSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
       loginRequest:Req,
       registerRequest:Req,
       loadrequest:Req,
        loginSuccess:Success,
        registerSuccess:Success,
        loadsuccess:Success,
        loginFail:Fail,
        registerFail:Fail,
        loadFail:Fail,
        clearErrors:ClearErrors,
        logoutSuccess:(state)=>{
         state.loading=false;
         state.isAuthenticated=false;
         state.user=null;
        },
        logoutFail:(state,action:PayloadAction<any>)=>{
            state.loading=false;
            state.error=action.payload;
        },  
    }
});


export const {loadFail,loadrequest,loadsuccess,loginFail,loginRequest,loginSuccess,logoutFail,logoutSuccess,registerFail,registerRequest,registerSuccess,clearErrors} = UserSlice.actions;


export default UserSlice.reducer;