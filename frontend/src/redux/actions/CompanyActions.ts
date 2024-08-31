import axios from "axios";
import {createAsyncThunk,Dispatch } from "@reduxjs/toolkit"; 


import {
StoreCompanytFail,
StoreCompanytReq,
StoreCompanytSuccess,
clearErrorStoreCompany,
clearStoredCompany
} from '../reducers/CompanyReducer';
import { Apiconfig, CompanyBaseApi } from "../../components/Constants/ApiConstants";



//Store Project
export const StoreCompany = createAsyncThunk('company/storing',async(params:{companyId:string},{ dispatch }: { dispatch: Dispatch })=>{
    try {
        dispatch(StoreCompanytReq());
        const route = `${CompanyBaseApi}/yourCompanies/Specific`;
        const {data} = await axios.post(route,params,Apiconfig);
        //console.log(data,'project');
        dispatch(StoreCompanytSuccess(data.company));
        localStorage.setItem('companyState', JSON.stringify(data.company));
        return { success: true }; 
    } catch (error:any) {
       dispatch(StoreCompanytFail(error.response.data.message));
       setTimeout(() => {
        dispatch(clearErrorStoreCompany());
      }, 3000);
    }
});


//Clear StoredProject 
export const ClearStoredCompany = createAsyncThunk('company/clear', async (_, { dispatch }) => {
      dispatch(clearStoredCompany());
      localStorage.removeItem('companyState');
  });

