import { Formik } from 'formik';
import {  useState } from 'react';
import * as Yup from "yup";
import { Project } from '../../../Types/ProjectType';


type UpdateProjectProps = {
  HandleUpdateProject: (updatedData: {
    UpdatedName: string;
    UpdatedDescription: string;
    UpdatedEstimatedStartDate: Date | string;
    UpdatedEstimatedEndDate: Date | string;
    projectID: string;
}) => Promise<void>
     project : Project;
     setEditProject: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        Editingproject: Project | null;
    }>>
}

const UpdateProject = ({HandleUpdateProject,project,setEditProject}:UpdateProjectProps) => {
    const [Loading,setLoading]=useState(false);
    const [error,setError]=useState('');

   
  return (
    <div className={`w-full h-full flex justify-center`}>
        {project &&
<div className='flex flex-col h-full w-full gap-2'>
    <h1 className='text-center w-full p-2 border-b-2 text-white'>Update Project : {project.ProjectName}</h1>
    <Formik
    initialValues={{Name:project.ProjectName,Description:project.Description,EstimatedEndDate:'',StartDate:''}}
        onSubmit={async values => {
          if((values.Name && values.Name!==project.ProjectName) || (values.Description && values.Description!==project.Description) || values.EstimatedEndDate || values.StartDate){
           try {
            setLoading(true);
            HandleUpdateProject({UpdatedName:values.Name,UpdatedDescription:values.Description,UpdatedEstimatedEndDate:values.EstimatedEndDate,UpdatedEstimatedStartDate:values.StartDate,projectID:project._id});
            setLoading(false);  
           } catch (error:any) {
            setLoading(false);
            console.log(error);
           }
          }else{
            setError('Please Change Atlease One Field');
            setTimeout(() => {
                setError('');
            }, 3000);
          }
        }}
        validationSchema={Yup.object().shape({
            Name: Yup.string(),
            Description: Yup.string(),
            EstimatedEndDate: Yup.date(),
            StartDate:Yup.date()
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
        } = props;

    return(
 <form className="space-y-4 md:space-y-6 h-max w-[900px]  py-2 px-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="Name"
              className="text-white font-bold md:text-lg block mb-2 text-sm   dark:text-white"
            >
              Project Name
            </label>
            <input
              type="text"
              name="Name"
              value={values.Name}
              onChange={handleChange}
              onBlur={handleBlur}
              id="Name"
              className={`${ errors.Name && touched.Name ? "border-red-500 border-2":'border-2'} text-white bg-transparent sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder={project.ProjectName}
            />
             {(errors.Name && touched.Name) || error && (
              <div className="text-sm text-red-500 font-bold">{errors.Name?errors.Name:error}{`*`}</div>
            )}
          </div>
          <div>
            <label
              htmlFor="Description"
              className="text-white font-bold md:text-lg block mb-2 text-sm   dark:text-white"
            >
              Project Description
            </label>
            <input
              type="text"
              name="Description"
              value={values.Description}
              onChange={handleChange}
              onBlur={handleBlur}
              id="Description"
              className={`${ errors.Description && touched.Description ? "border-red-500 border-2":'border-2'} text-white bg-transparent   sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder={project.Description?project.Description:'Provide a Project Description'}
              
            />
             {errors.Description && touched.Description && (
              <div className="text-sm text-red-500 font-bold">{errors.Description}{`*`}</div>
            )}
          </div>
          <div className='flex justify-between gap-2 '>
          <div className='flex-1'>
            <label
              htmlFor="StartDate"
              className="text-white font-bold md:text-sm block mb-2 text-sm   dark:text-white"
            >
              Set a Estimated Start Date For The Project 
              <span className='text-xs ml-3'>{`(Provided: ${new Date(project.StartDate).toLocaleDateString()})`}</span>
            </label>
            <input
              type="date"
              name="StartDate"
              min={new Date().toISOString().split('T')[0]}
              value={values.StartDate}
              onChange={handleChange}
              onBlur={handleBlur}
              id="StartDate"
              className={`${ errors.StartDate && touched.StartDate ? "border-red-500 border-2":'border-2'} bg-transparent text-white   sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
            />
             {errors.StartDate && touched.StartDate && (
              <div className="text-sm text-red-500 font-bold">{errors.StartDate}{`*`}</div>
            )}
          </div>
          <div className='flex-1'>
            <label
              htmlFor="EstimatedEndDate"
              className="text-white font-bold md:text-sm block mb-2 text-sm   dark:text-white"
            >
              Set a Estimated End Date For The Project 
              <span className='text-xs ml-3'>{`(Provided: ${project.EstimatedEndDate? new Date(project.EstimatedEndDate).toLocaleDateString():'N/A'})`}</span>
            </label>
            <input
              type="date"
              name="EstimatedEndDate"
              min={new Date().toISOString().split('T')[0]}
              value={values.EstimatedEndDate}
              onChange={handleChange}
              onBlur={handleBlur}
              id="EstimatedEndDate"
              className={`${ errors.EstimatedEndDate && touched.EstimatedEndDate ? "border-red-500 border-2":'border-2'} bg-transparent text-white   sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              
            />
             {errors.EstimatedEndDate && touched.EstimatedEndDate && (
              <div className="text-sm text-red-500 font-bold">{errors.EstimatedEndDate}{`*`}</div>
            )}
          </div>
          
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative text-white font-bold opacity-80 hover:bg-background hover:opacity-100 bg-secondary focus:ring-4 focus:outline-none  focus:ring-primary-300 font-serif rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
           <span className='sm:text-base text-xs'>Update Project</span>
            <div role="status" className={`${Loading?'':'hidden'} absolute right-2 sm:right-5 top-3 sm:top-2`}>
  <svg
    aria-hidden="true"
    className="sm:w-6 sm:h-6 w-5 h-5 text-white  animate-spin dark:text-gray-600 fill-green-600"
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
            onClick={()=>setEditProject({
                Editingproject:null,
                isOpen:false
            })}
            disabled={isSubmitting}
            className="w-full relative text-white font-bold opacity-80 hover:bg-background hover:opacity-100 bg-secondary focus:ring-4 focus:outline-none  focus:ring-primary-300 font-serif rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
           >
           <span className='sm:text-base text-xs'>Cancel</span>
          </button>

        </form>
          )}} 
  </Formik>
  </div>
}
  </div>
  )}

export default UpdateProject