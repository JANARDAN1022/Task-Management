// OTPComponent.tsx
import React, { useCallback, useEffect, useState } from 'react';
import OTPInput from './OtpInput';
import { useAppDispatch, useAppSelector } from '../../../../Hooks';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Apiconfig, UserBaseApi } from '../../../Constants/ApiConstants';
import { OtpLoginUser } from '../../../../redux/actions/UserActions';
import { unwrapResult } from '@reduxjs/toolkit';

const OTPComponent = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [otpEmail,setOtpEmail]=useState('');
  const [Loading,setLoading]=useState(false);
  const [otpExpired,setOtpExpired]=useState(false);
  const { user, isAuthenticated, loading,error } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  useEffect(()=>{
console.log(error,'error');
  },[error])

  const checkUser = useCallback(() => {
    if (user && !loading && isAuthenticated) {
      if ((user.Role !== 'admin' && user.Approved) || user.Role === 'admin') {
        const previousPageUrl = sessionStorage.getItem('prevPath');
        if (previousPageUrl) {
          navigate(previousPageUrl);
          sessionStorage.removeItem('prevPath');
        } else {
          navigate('/Company');
        }
      } else {
        navigate('/Wait-For-Approval');
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);


const OtpExists = async(email:string)=>{
  if(email){
  try {
    setLoading(true)
    const {data} = await axios.post(`${UserBaseApi}/OTP/check`,{email:email},Apiconfig);
    if(data){
      if(data.OTPExpired){
        setOtpExpired(true);
        setResendEnabled(true);
        setTimerStarted(false);
        setTimerSeconds(0);
        setOtp(['','','','','','']);
        localStorage.removeItem('Timer');
      }else{
        const storedTimer = localStorage.getItem('Timer');
        if (storedTimer) {
          setTimerSeconds(Number(storedTimer));
        }else{
          setTimerSeconds(120);
        }
        setOtpExpired(false);
        setResendEnabled(false);
      setTimerStarted(true);
      }
      console.log(data,'data');
      setLoading(false)
    }
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
}
}

  useEffect(() => {
    const OtpEmailExists = localStorage.getItem('OtpEmail');
   
    if(OtpEmailExists){
      setOtpEmail(OtpEmailExists);
     OtpExists(OtpEmailExists);
    }
    let timerInterval: NodeJS.Timeout;

    if (timerStarted && !resendEnabled) {
      timerInterval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            localStorage.removeItem('Timer');
            clearInterval(timerInterval);
             if(otpEmail){
             OtpExists(otpEmail);
             }
            return 0;
          }
          localStorage.setItem('Timer', (prev - 1).toString());
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [timerStarted, resendEnabled]);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input field
      if (value && index < otp.length - 1) {
        const nextInput = document.querySelector(`input:nth-of-type(${index + 2})`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (index > 0) {
        if (otp[index] === '') {
          const prevInput = document.querySelector(`input:nth-of-type(${index})`) as HTMLInputElement;
          prevInput?.focus();
        } else {
          const newOtp = [...otp];
          newOtp[index] = '';
          setOtp(newOtp);
          if (index === otp.length - 1) {
            const currentInput = document.querySelector(`input:nth-of-type(${index + 1})`) as HTMLInputElement;
            currentInput?.focus();
          }else{
          const prevInput = document.querySelector(`input:nth-of-type(${index})`) as HTMLInputElement;
          prevInput?.focus();
          }
        }
      }
    } else if (e.key === 'ArrowLeft') {
        if (index > 0) {
          const prevInput = document.querySelector(`input:nth-of-type(${index})`) as HTMLInputElement;
          prevInput?.focus();
        }
      } else if (e.key === 'ArrowRight') {
        if (index < otp.length - 1) {
          const nextInput = document.querySelector(`input:nth-of-type(${index + 2})`) as HTMLInputElement;
          nextInput?.focus();
        }
      }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-numeric characters
    const limitedData = pastedData.slice(0, 6); // Limit to 6 digits
    const newOtp = [...otp];
  
    for (let i = 0; i < limitedData.length; i++) {
      newOtp[i] = limitedData[i];
    }
    
    setOtp(newOtp);
  
    // Move focus to the last filled input field
    const nextIndex = limitedData.length < otp.length ? limitedData.length : otp.length - 1;
    const nextInput = document.querySelector(`input:nth-of-type(${nextIndex + 1})`) as HTMLInputElement;
    nextInput?.focus();
  };


  const handleResendOTP = async()=>{
    if(otpEmail && otpEmail!==''){
    try {
      setLoading(true)
      const {data} = await axios.post(`${UserBaseApi}/OTP/send`,{email:otpEmail},Apiconfig)
       if(data){
        OtpExists(otpEmail);
          console.log(data,'otp Re-sent');
       }
       setLoading(false)
    } catch (error) {
      localStorage.removeItem('OtpEmail');
      console.log(error);
      setLoading(false);
    }
  }else{
    console.log('email does not exist');
    setLoading(false);
    return;
  }
  }

  // const handleResendOTP = () => {
  //   setTimerSeconds(120);
  //   setTimerStarted(true);
  //   setResendEnabled(false);
  // };

  const handleVerifyOTP = async() => {
    console.log('OTP:', otp.join(''));
    try {
      setLoading(true);
      const response = await  dispatch(OtpLoginUser(Number(otp.join(''))));
       const result = unwrapResult(response);
       if(result?.success){
        localStorage.removeItem('Timer');
        navigate("/Company");
       }
       setLoading(false);  
    } catch (error:any) {
      setLoading(false);
      console.log(error.message);
    }
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{otpExpired?'Requested OTP Has Expired Click Resend':'Enter OTP'}</h2>
        <OTPInput
        disabled={otpExpired}
          otp={otp}
          onChange={handleOTPChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste} // Added handlePaste to OTPInput component
        />
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleVerifyOTP}
            className={`${otp.join('').length !== 6 || Loading?'opacity-60':'opacity-100 hover:bg-indigo-500'} w-full  py-2 px-4 bg-indigo-600 text-white rounded-lg `}
            disabled={otp.join('').length !== 6 || Loading || otpExpired}
          >
            Verify OTP
          </button>
          <button
            onClick={()=>handleResendOTP()}
            disabled={!resendEnabled || Loading}
            className={`w-full py-2 px-4 rounded-lg ${resendEnabled && !Loading ? 'hover:bg-blue-500 bg-blue-600' : 'bg-gray-400'} text-white `}
          >
            {resendEnabled ? 'Resend OTP' : `Resend OTP in: ${Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
          </button>
        </div>
       <span className='text-red-500 font-bold'> {error && error!=='Please login' && error} </span>
      </div>
    </div>
  );
};

export default OTPComponent;
