import { useLocation } from "react-router-dom";
import Sidebar from "../components/layouts/SideBar/SideBar";
import { useContext, useState } from "react";
import { MainContext } from "../context/MainContext";


const ShowSideBar = ()=> {
  const {displayCreateModal,deleteColumn} = useContext(MainContext);
  const [HoveredSideBar,setHoveredSideBar]=useState(false);
const [HideSideBar,setHideSideBar]=useState(false);
  const location = useLocation();
  const Location = location.pathname;
  const hideNav = Location==='/OTP/verify' ||  Location === "/Login" || Location==='/Register' || Location==='/Wait-For-Approval' || Location==='/' || Location.includes('/password/reset') || Location.includes('/Projects') || Location==='/Test' || Location==='/ForgotPassword' || Location ==='/Company' || Location==='/Company/Create' || Location==='/YourCompanies' || Location==="/Company/Join" || Location==='/JoinedCompanies';

  if (hideNav) {
    return null; // Return null to hide the navbar
  }else{
  return (
    <div className={`${displayCreateModal || (deleteColumn.Deleting && deleteColumn.DeleteColumnId!=='' && deleteColumn.StatusName!=='')?'blur pointer-events-none':''} ${HideSideBar?'w-max duration-300':'flex-1 duration-300'}  h-screen transition-all   ease-in-out`}>
  <Sidebar HoveredSideBar={HoveredSideBar} setHoveredSideBar={setHoveredSideBar} HideSideBar={HideSideBar} setHideSideBar={setHideSideBar}/>
  </div>
  )
};
}

export default ShowSideBar;
