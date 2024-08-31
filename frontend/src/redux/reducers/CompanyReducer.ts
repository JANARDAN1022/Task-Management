import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyState } from '../../Types/CompanyType';


const initialState:CompanyState ={
    loading: false,
    company:null,
}

const Req = (state:CompanyState)=>{
    state.loading=true;
}

const Success = (state:CompanyState,action:PayloadAction<Company>)=>{
    state.loading=false;
    state.company= action.payload;
}

const Fail = (state:CompanyState,action:PayloadAction<string>)=>{
    state.loading=false;
    state.company=null;
    state.error=action.payload;
}


const ClearErrors = (state:CompanyState)=>{
    state.error=null;
}

const ClearStoredProject = (state:CompanyState)=>{
    state.company=null;
}

const CompanySlice = createSlice({
    name:'company',
    initialState,
    reducers:{
       StoreCompanytReq:Req,
       StoreCompanytSuccess:Success,
       StoreCompanytFail:Fail,
       clearStoredCompany:ClearStoredProject,
       clearErrorStoreCompany:ClearErrors,

    }
});


export const {StoreCompanytFail,StoreCompanytReq,StoreCompanytSuccess,clearErrorStoreCompany,clearStoredCompany} = CompanySlice.actions;


export default CompanySlice.reducer;