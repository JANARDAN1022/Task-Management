import { useCallback, useEffect } from 'react'
import {  useAppSelector } from '../../../Hooks';
import { useNavigate } from 'react-router-dom';
import Login from '../auth/Login';

const Home = () => {
const {user} = useAppSelector((state)=>state.user);
const Navigate = useNavigate();


const CheckUser = useCallback(()=>{
    if(user){
     if(user.Approved){
     Navigate('/Projects');
     }else{
     Navigate('/Wait-For-Approval')
     }
    }else{
        Navigate('/Login')
    }
 },[user]);
 
     useEffect(()=>{
       CheckUser();
     },[CheckUser]);
  return (
  <Login />
  )
}

export default Home