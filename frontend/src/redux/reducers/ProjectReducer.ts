import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Project,ProjectState}  from '../../Types/ProjectType';


const initialState:ProjectState ={
    loading: false,
    project:null,
}

const Req = (state:ProjectState)=>{
    state.loading=true;
}

const Success = (state:ProjectState,action:PayloadAction<Project>)=>{
    state.loading=false;
    state.project= action.payload;
}

const Fail = (state:ProjectState,action:PayloadAction<string>)=>{
    state.loading=false;
    state.project=null;
    state.error=action.payload;
}


const ClearErrors = (state:ProjectState)=>{
    state.error=null;
}

const ClearStoredProject = (state:ProjectState)=>{
    state.project=null;
}

const ProjectSlice = createSlice({
    name:'project',
    initialState,
    reducers:{
       storeProjectReq:Req,
       storeProjectSuccess:Success,
       storeProjectFail:Fail,
       clearStoredProject:ClearStoredProject,
       clearErrorStoreProject:ClearErrors,

    }
});


export const {clearErrorStoreProject,clearStoredProject,storeProjectFail,storeProjectReq,storeProjectSuccess} = ProjectSlice.actions;


export default ProjectSlice.reducer;