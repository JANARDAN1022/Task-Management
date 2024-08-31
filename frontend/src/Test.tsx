import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';

const Test = () => {
    const Location = useLocation();
    const Pathname = Location.pathname;
      useEffect(()=>{
        console.log(Pathname,'--Test-');
      },[Pathname]);
  return (
    null
  )
}

export default Test