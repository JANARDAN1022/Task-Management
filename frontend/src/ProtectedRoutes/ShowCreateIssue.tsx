import { useLocation } from "react-router-dom";
import CreateIssue from "../components/layouts/Issues/CreateIssue";




const ShowCreateIssue = ()=> {
  const location = useLocation();
  const Location = location.pathname;
 const hideCreateIssue = 
  Location==='/OTP/verify' ||  Location === "/Login" || Location.includes('/password/reset') 
 || Location==='/Register' || Location==='/Wait-For-Approval' || Location==='/ForgotPassword' 
 || Location ==='/Company' || Location==='/Company/Create' || Location==='/YourCompanies' 
 || Location==="/Company/Join" || Location==='/JoinedCompanies'

  const ShowCreateIssue =  !Location.includes('Projects') || !Location.includes('projects');
  if (!ShowCreateIssue || hideCreateIssue) {
    return null; // Return null to hide the Create Issue Modal
  }else{
  return (

  <CreateIssue />
  )
};
}

export default ShowCreateIssue;
