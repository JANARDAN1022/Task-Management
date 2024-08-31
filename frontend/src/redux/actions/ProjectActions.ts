import axios from "axios";
import {createAsyncThunk,Dispatch } from "@reduxjs/toolkit"; 


import {
    clearErrorStoreProject,
    clearStoredProject,
    storeProjectFail,
    storeProjectReq,
    storeProjectSuccess
} from '../reducers/ProjectReducer';
import { Apiconfig, ProjectBaseApi } from "../../components/Constants/ApiConstants";



//Store Project
export const StoreProject = createAsyncThunk('project/storing',async(params:{id:string,projectID:string},{ dispatch }: { dispatch: Dispatch })=>{
    try {
        dispatch(storeProjectReq());
        const route = `${ProjectBaseApi}/Specific`;
        const {data} = await axios.post(route,params,Apiconfig);
        //console.log(data,'project');
        dispatch(storeProjectSuccess(data.SpecificProject));
        localStorage.setItem('projectState', JSON.stringify(data.SpecificProject));
        return { success: true }; 
    } catch (error:any) {
       dispatch(storeProjectFail(error.response.data.message));
       setTimeout(() => {
        dispatch(clearErrorStoreProject());
      }, 3000);
    }
});


//Clear StoredProject 
export const ClearStoredProject = createAsyncThunk('project/clear', async (_, { dispatch }) => {
      dispatch(clearStoredProject());
      localStorage.removeItem('projectState');
  });

