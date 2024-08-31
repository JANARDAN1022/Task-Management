import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../../Hooks';
//import { useNavigate } from 'react-router-dom';
//import { Link } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import { Ticket } from '../../../Types/TicketsType';
import { Apiconfig, ProjectBaseApi, StatusBaseApi, TicketBaseApi, UserBaseApi } from '../../Constants/ApiConstants';
import axios from 'axios';
import { MainContext } from '../../../context/MainContext';
import { RxCross2 } from "react-icons/rx";
import { User } from '../../../Types/UserTypes';
import { Status } from '../../../Types/StatusTypes';

const CreateIssue = () => {

//const Navigate = useNavigate();
const [Loading,setLoading]=useState(false);
const {displayCreateModal,setDisplayCreateModal,projects,setProjects,tickets} = useContext(MainContext);
const {user,loading,isAuthenticated} = useAppSelector((state)=>state.user);
const {project} = useAppSelector((state)=>state.project);
const {company} = useAppSelector(state=>state.company);
const [availableParentTickets,setAvailableParentTickets]=useState<Ticket[]>([]);
const [availableChildrenTickets,setAvailableChildrenTickets]=useState<Ticket[]>([]);
const [selectedType,setSelectedType]=useState('');
const [ProjectId,setProjectId]=useState('');
const [usersWithProjectAccess,setUsersWithProjectAccess]=useState<User[]>([]);
const [statuses,setStatuses]=useState<Status[]>([]);
const scrollref = useRef<HTMLDivElement>(null);


const FetchProjects = useCallback(async()=>{
    if(user && !loading &&  isAuthenticated && company){
    try {
      
     const  Route = `${ProjectBaseApi}/All`;
      setLoading(true);
      const {data} = await axios.post(Route,{company:company._id},Apiconfig); 
      if(data && data.AllProjects){
        console.log(data,'projects');
       setProjects(data.AllProjects)
       setLoading(false)
      }else{
        console.log('no Data');
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.log(error,'error Fetching Projects')
      setLoading(false);
    }
       }
    },[user,project]);
    
    useEffect(()=>{
        FetchProjects();
    },[FetchProjects]);

const scrollToTop=()=>{
  if(scrollref.current){
     scrollref.current.scrollTo({top:0,behavior:'smooth'});
    }
}
    useEffect(()=>{
scrollToTop();
},[scrollToTop]);


const FetchParentTickets = useCallback(async(Relation:string)=>{
  if(ProjectId && Relation && selectedType!==''){
   try { 
    const Route = `${TicketBaseApi}/All/Relation`
    const Body:{
      projectId:string,
      Relation:string,
      SelectedType:string,
    } = {
      projectId: ProjectId,
      Relation:Relation,
      SelectedType:selectedType,
    }
     const {data} = await axios.post(Route,Body,Apiconfig);
     if(data){
      // console.log(data,'parentData');
       if(Relation==='parent'){
       setAvailableParentTickets(data as Ticket[]);
       }else if(Relation==='children'){
         setAvailableChildrenTickets(data as Ticket[]);
       }
      }
   } catch (error) {
     console.log(error,'parentError');
   }
  }
},[ProjectId,selectedType]);

const FetchUsersWithprojectAccess = useCallback(async()=>{
if(ProjectId){
  try {
    const Route = `${UserBaseApi}/All`
    const {data} = await axios.post(Route,{projectID:ProjectId},Apiconfig);
    if(data && data.success){
      setUsersWithProjectAccess(data.UsersWithAccess as User[]);
    }else{
      console.log('no data user project access fetch')
    }
  } catch (error) {
    console.log(error);
  }
}

},[ProjectId]);


const FetchStatuses = useCallback(async()=>{
if(ProjectId){
  try {
    setLoading(true)
    const Route = `${StatusBaseApi}/All`;
    const {data} = await axios.post(Route,{ProjectId:ProjectId},Apiconfig);
    if(data && data.success){
      setStatuses(data.AllStatus as Status[]);
    }
    setLoading(false)
  } catch (error) {
    console.log(error);
    setLoading(false)
  }
}

},[ProjectId,tickets]);

useEffect(()=>{
FetchUsersWithprojectAccess()
FetchStatuses()
},[FetchUsersWithprojectAccess,FetchStatuses]);



useEffect(()=>{
  FetchParentTickets('parent');
  FetchParentTickets('children');
},[FetchParentTickets]);
  

  return (

    <section className={`${displayCreateModal?'z-[999]':'hidden'} absolute top-10   select-none dark:bg-gray-900 overflow-hidden w-full max-w-full  h-full`}>
    <div className="flex  flex-col gap-5  items-center justify-center p-2  mx-auto">
    <div ref={scrollref} className="w-full max-w-2xl relative  h-full max-h-[550px] overflow-y-auto bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
    
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <div className='flex flex-col gap-1'>
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Create New Issue
        </h1>
        <span className='text-sm font-normal'>Required fields are marked with an asterisk *</span>
        </div>

        <Formik
        initialValues={{
        title:"",
        type: "",
        projectID: "",
        description: "",
        status: "",
        labels: [""],
        attachments: [""],
        assignedby: "",
        assignedTo: "",
        children: [],
        parent:'',
        }}
        onSubmit={async (values,{resetForm}) => {
          console.log('before')

          if(values.title && values.projectID && user){
            values.assignedby=user._id;
           try {
            //console.log({...values},'val');
            setLoading(true);
            const Route = `${TicketBaseApi}/Create`;
            const {data} = await axios.post(Route,{...values},Apiconfig);
             if(data && data.success){
            //console.log(data,'submit'); 
            resetForm();
             setDisplayCreateModal(false);  
          }
             setLoading(false);  
           } catch (error:any) {
            setLoading(false);
            resetForm();
            console.log(error);
           }
          }else{
            console.log('not matched')
          }
        }}
        validationSchema={Yup.object().shape({
          title:Yup.string().required("*Title is required"),
          type:Yup.string().required("*Type is required"),
          projectID: Yup.string().required("*Project is required"),
          description: Yup.string(),
          status: Yup.string(),
          labels: Yup.array(Yup.string()),
          attachments: Yup.array(Yup.string()),
          assignedby: Yup.string(),
          assignedTo: Yup.string(),
          children: Yup.array(),
          parent:Yup.string(),
        })
      }
        >
          {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          resetForm
        } = props;

       



        return (
        <form className="space-y-4 md:space-y-6 relative" onSubmit={handleSubmit}>
          <RxCross2  onClick={()=>{
       resetForm()
       setDisplayCreateModal(false)
       }}  className='text-[20px] md:text-[30px] opacity-70 hover:opacity-100 text-gray-600 hover:text-red-500 transition-all duration-300 ease-in-out absolute top-[-100px] right-0 z-[9999] cursor-pointer'/>
          <div>
            <label
              htmlFor="projectID"
              className="block mb-2 text-sm font-medium text-gray-900  dark:text-white"
            >
              Select Project *
            </label>
            <select
            disabled={Loading}
              name="projectID"
              value={values.projectID}
              onChange={(e)=>{
                handleChange(e)
                setProjectId(e.target.value);
              }
            }
              onBlur={handleBlur}
              id="projectID"
              className={`${ errors.projectID && touched.projectID ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              required
            >
                <option value=''>Select</option>
             {projects && projects.length>0?
               projects.map((project)=>(
                <option key={project._id} value={`${project._id}`}>{project.ProjectName}</option> 
               ))
               :
               <option value=''>No Projects Found</option>
            }
            </select>
             {errors.projectID && touched.projectID && (
              <div className="text-sm text-red-500 font-bold">{errors.projectID}{`*`}</div>
            )}
          </div>
          <div>
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Title *
            </label>
            <input
            disabled={Loading}
              type="text"
              name="title"
              max={40}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="title"
              placeholder="Provide a Title For the Issue/Ticket"
              className={`${ errors.title && touched.title ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              required
              autoComplete='off'
            />
 
             {errors.title && touched.title && (
              <div className="text-sm text-red-500 font-bold">{errors.title}{`*`}</div>
            )}
          </div>
         
          <div>
            <label
              htmlFor="type"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              type *
            </label>
            <select
            disabled={Loading}
              name="type"
              value={values.type}
              onChange={(e)=>{
                handleChange(e)
                setSelectedType(e.target.value);
              }}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="type"
              className={`${ errors.type && touched.type ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              required
              autoComplete='off'
            >
                <option  value=''>Select</option>
                <option value='epic'>Epic</option>
                <option value='story'>Story</option>
                <option value='task'>Task</option>
                <option value='subTask'>Sub Task</option>
           
            </select>
 
             {errors.type && touched.type && (
              <div className="text-sm text-red-500 font-bold">{errors.type}{`*`}</div>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              status
            </label>
            <select
            disabled={Loading}
              name="status"
              value={values.status}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="status"
              className={`${ errors.status && touched.status ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              required
              autoComplete='off'
            >
                <option  value=''>Select</option>
                {statuses && statuses.map((status)=>(
                  <option key={status._id} value={`${status._id}`}>{status.StatusName}</option>
                ))}
           
            </select>
 
          </div>



          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              description
            </label>
            <textarea
            disabled={Loading}
              name="description"
              maxLength={300}
              rows={3}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="description"
              placeholder="Provide a description For the Issue/Ticket"
              className={`resize-none ${ errors.description && touched.description ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              
              autoComplete='off'
            />
 
             {errors.description && touched.description && (
              <div className="text-sm text-red-500 font-bold">{errors.description}{`*`}</div>
            )}
          </div>

          {values.projectID!=='' && 
          <div>
            <label
              htmlFor="assignedTo"
              className="block mb-2 text-sm font-medium text-gray-900  dark:text-white"
            >
              Assign To 
            </label>

            
            <select
            disabled={Loading}
              name="assignedTo"
              value={values.assignedTo}
              onChange={handleChange}
              onBlur={handleBlur}
              id="projectID"
              className={`${ errors.assignedTo && touched.assignedTo ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
            >
                <option value=''>UnAssigned</option>
             {usersWithProjectAccess && usersWithProjectAccess.length>0?
               usersWithProjectAccess.map((User)=>(
                <option key={User._id} value={`${User._id}`}>{ User._id===user?._id?'Assign YouSelf':`${User.FirstName} ${User.LastName}`}</option> 
               ))
               :
               <option value=''>No Users Found</option>
            }
            </select>
             {errors.assignedTo && touched.assignedTo && (
              <div className="text-sm text-red-500 font-bold">{errors.assignedTo}{`*`}</div>
            )}
          </div>
          }
           {values.type!=='' && values.type!=='epic' && values.projectID!=='' &&
          <div>
            <label
              htmlFor="parent"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Add Parent
            </label>
            <select
            disabled={Loading}
              name="parent"
              value={values.parent}
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="parent"
              className={`${ errors.parent && touched.parent ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
             
              autoComplete='off'
            >
                <option  value=''>Select</option>
                {availableParentTickets && availableParentTickets.length>0 &&
                availableParentTickets.map((parentTicket)=>(
                  <option key={parentTicket._id} className='flex items-center'  value={parentTicket._id}>{parentTicket.title} {''} {parentTicket.ticketNumber} {''} {''} {parentTicket.type}</option>  
                ))
                }
            </select>
 
             {errors.parent && touched.parent && (
              <div className="text-sm text-red-500 font-bold">{errors.parent}{`*`}</div>
            )}
          </div>
          }

          {values.type!=='' && values.type!=='subTask' && values.projectID!=='' &&
          <div>
            <label
              htmlFor="children"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Add Children
            </label>
            <select
            disabled={Loading}
              name="children"
              value={values.children} 
               multiple
              onChange={handleChange}
              onBlur={handleBlur}
              onPaste={e => e.preventDefault()}
              id="children"
              className={`${ errors.children && touched.children ? "border-red-500 outline-red-500":''} bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              
              autoComplete='off'
            >
                <option  value=''>Select</option>
                {availableChildrenTickets && availableChildrenTickets.length>0 &&
                availableChildrenTickets.map((childrenTicket)=>(
                  <option key={childrenTicket._id} className='flex items-center'  value={childrenTicket._id}>{childrenTicket.title} {''} {childrenTicket.ticketNumber} {''} {''} {childrenTicket.type}</option>  
                ))
                }
            </select>
 
             {errors.children && touched.children && (
              <div className="text-sm text-red-500 font-bold">{errors.children}{`*`}</div>
            )}
          </div>
          }
          <div className='flex flex-col gap-2'>
          <button
            type="submit"
            disabled={isSubmitting || Loading}
            className="w-full relative  opacity-80  hover:opacity-100 bg-background text-white  focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
           <span className='sm:text-base text-xs'>Create Ticket</span>
            <div role="status" className={`${Loading?'':'hidden'} absolute right-2 sm:right-5 top-3 sm:top-2`}>
  <svg
    aria-hidden="true"
    className="sm:w-6 sm:h-6 w-5 h-5 text-white  animate-spin dark:text-gray-600 fill-background"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
</div>
          </button>
          <button
            type="button"
            onClick={()=>{
              resetForm()
              setDisplayCreateModal(false)
            }}
            disabled={isSubmitting || Loading}
            className="w-full relative text-gray-500 opacity-80  hover:opacity-100 bg-ticketBtns focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
           <span className='sm:text-base text-xs'>Cancel</span>
           </button>
          </div>
        </form>
         );
        }}
        </Formik>
       
      </div>
    </div>
  </div>
</section>

  )
}

export default CreateIssue