import './App.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Projects from './components/pages/Projects/Projects.tsx';
import Login from './components/pages/auth/Login.tsx';
import Register from './components/pages/auth/Register.tsx';
import Approval from './components/pages/auth/Approval.tsx';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './Hooks.ts';
import { Loaduser } from './redux/actions/UserActions.ts';
import ShowNav from './ProtectedRoutes/ShowNav.tsx';
import ShowSideBar from './ProtectedRoutes/ShowSideBar.tsx';
import Timeline from './components/layouts/Timeline/Timeline.tsx';
import KanBoard from './components/layouts/KANBoard/KanBoard.tsx';
import Dashboard from './components/layouts/Dashboard/Dashboard.tsx';
import Issues from './components/layouts/Issues/Issues.tsx';
import SyncUp from './components/layouts/SyncUp/SyncUp.tsx';
import ProjectSettings from './components/layouts/ProjectSettings/ProjectSettings.tsx';
import Bin from './components/layouts/Bin/Bin.tsx';
import Home from './components/pages/home/Home.tsx';
import CreateIssue from './components/layouts/Issues/CreateIssue.tsx';
import ShowCreateIssue from './ProtectedRoutes/ShowCreateIssue.tsx';
import ProjectsBin from './components/pages/Projects/ProjectsBin.tsx';
import { MainContext } from './context/MainContext.tsx';
import ForgotPassword from './components/pages/auth/ForgotPassword.tsx';
import ResetPassword from './components/pages/auth/ResetPassword.tsx';
import OTPComponent from './components/pages/auth/OTP/Otp.tsx';
import Profile from './components/layouts/Profile/Profile.tsx';
import Company from './components/layouts/Company/Company.tsx';
import CreateCompany from './components/layouts/Company/CreateCompany.tsx';
import YourCompanies from './components/layouts/Company/YourCompanies.tsx';
import JoinCompany from './components/layouts/Company/JoinCompany.tsx';
import {io} from 'socket.io-client';
import JoinedCompanies from './components/layouts/Company/JoinedCompanies.tsx';
//import Test from './Test.tsx';

const App = () => {
  const socket = io('http://localhost:5000');
  const dispatch = useAppDispatch();
  const {displayCreateModal} = useContext(MainContext);
  const {user,loading} = useAppSelector(state=>state.user);
  const {company} = useAppSelector(state=>state.company)
  const [userSocketConnected,setUserSocketConnected]=useState(false);
  const FetchUser = useCallback(()=>{
    const Data:{companyId?:string} = { }
    if(company){
      Data.companyId = company._id;
    }
    dispatch(Loaduser(Data));
   },[dispatch]);

  useEffect(()=>{
    FetchUser();
  },[FetchUser]);

  useEffect(() => {
    if(user && !loading && !userSocketConnected){
      console.log('called socket');
    socket.emit('user-connected',(user?._id,false,Date.now(),Date.now() + 20));
    socket.on('get-users',(users)=>{
      console.log(users,'active Users');
    });
    const body = document.body;
    body.style.overflowX = 'hidden';
    setUserSocketConnected(true);
    socket.on('notification', (data) => {
      console.log('Received notification:', data.message);
      // Display the notification to the user, e.g., using a toast or alert
      alert(data.message); 
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }
  }, [user,loading]);


  return (
    <Router>
      {/* <Test /> */}
      <div className='flex flex-col w-screen  h-full bg-background'>
      <ShowNav />
      <div className='flex w-full h-full'>
      <ShowSideBar />
      <ShowCreateIssue />
      <div className={`${displayCreateModal?'blur pointer-events-none':''} flex-[5] transition-all  duration-500 ease-in-out`}>
      <Routes>
      <Route path='/Login' element={<Login />} />
      <Route path='/ForgotPassword' element={<ForgotPassword />} />
      <Route path='/password/reset/:token' element={<ResetPassword />} />
      <Route path='/Company' element={<Company />} />
      <Route path='/Company/Create' element={<CreateCompany />} />
      <Route path='/YourCompanies' element={<YourCompanies />} />
      <Route path='/JoinedCompanies' element={<JoinedCompanies />} />
      <Route path='/Company/Join' element={<JoinCompany />} />
      <Route path='/' element={<Home />} />
      <Route path='/Register' element={<Register />} />
      <Route path='/OTP/verify' element={<OTPComponent />} />
      <Route path='/projects/:projectName/Timeline' element={<Timeline />} />
      <Route path='/projects/:projectName/Board' element={<KanBoard />} />
      <Route path='/projects/:projectName/Dashboard' element={<Dashboard />} />
      <Route path='/projects/:projectName/Issues' element={<Issues />} />
      <Route path='/projects/:projectName/Sync-Up' element={<SyncUp />} />
      <Route path='/projects/:projectName/Bin' element={<Bin />} />
      <Route path='/projects/:projectName/Settings' element={<ProjectSettings />} />
      <Route path='/projects/:projectName/Profile' element={<Profile />} />
      <Route path='/:Company/Projects' element={<Projects />} />
      <Route path='/Projects/Bin' element={<ProjectsBin />} />
      <Route path='/Wait-For-Approval' element={<Approval />} />
      <Route path='/test' element={<CreateIssue />} />
      </Routes>
      </div>
      </div>
      </div>
    </Router>
  )
}

export default App