import { useLocation } from "react-router-dom";
import Navbar from "../components/layouts/Navbar/Navbar";



const ShowNav = ()=> {
  const location = useLocation();
  const Location = location.pathname;
  const hideNav = Location==='/OTP/verify' || Location === "/Login" || Location==='/Register' || Location.includes('/password/reset') || Location==='/Wait-For-Approval' || Location==='/ForgotPassword' || Location ==='/Company' || Location==='/Company/Create' || Location==='/YourCompanies' || Location==="/Company/Join" || Location==='/JoinedCompanies';

  if (hideNav) {
    return null; // Return null to hide the navbar
  }else{
  return (
  <Navbar />
  )
};
}

export default ShowNav;
