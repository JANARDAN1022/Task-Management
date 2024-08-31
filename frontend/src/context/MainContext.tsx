import React,{createContext, useState,ReactNode} from "react";
import { Project } from "../Types/ProjectType";
import { Ticket } from "../Types/TicketsType";

interface MainContextType {
    confirmDelete: {
        isOpen: boolean;
        projectId: string;
        projectName: string;
    };
    editProject: {
        isOpen: boolean;
        Editingproject: any;
    };
    viewProject: {
        isOpen: boolean;
        project: any;
    };
    displayCreateProject:boolean;
    displayCreateModal:boolean;
    projects: Project[];
    deleteColumn: {
        Deleting: boolean;
        DeleteColumnId: string;
        StatusName: string;
    };
    displayTicketDetails: {
        displayDetails: boolean;
        ticketId: string;
    };
    tickets:Ticket[];
    ticket:Ticket | null
    setTicket: React.Dispatch<React.SetStateAction<Ticket | null>>
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    setDisplayTicketDetails: React.Dispatch<React.SetStateAction<{
        displayDetails: boolean;
        ticketId: string;
    }>>
    setDeleteColumn: React.Dispatch<React.SetStateAction<{
        Deleting: boolean;
        DeleteColumnId: string;
        StatusName: string;
    }>>;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    setDisplayCreateProject: React.Dispatch<React.SetStateAction<boolean>>;
    setDisplayCreateModal: React.Dispatch<React.SetStateAction<boolean>>
    setviewProject: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        project: any;
    }>>;
    setEditProject: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        Editingproject: any;
    }>>;
    setConfirmDelete: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        projectId: string;
        projectName: string;
    }>>;
}

export const MainContext = createContext<MainContextType>({
    confirmDelete:{
        isOpen:false,
        projectId:'',
        projectName:''
    },
    editProject:{
        isOpen:false,
        Editingproject:null as null|Project
    },
    viewProject:{
        isOpen:false,
        project:null as null|Project
      
    },
    displayCreateProject:false,
    displayCreateModal:false,
    projects:[],
    deleteColumn:{
        DeleteColumnId:'',
        Deleting:false,
        StatusName:''
    },
    displayTicketDetails:{
        displayDetails:false,
        ticketId:'',
    },
    tickets:[],
    ticket:null,
    setTicket:()=>{},
    setTickets:()=>{},
    setDisplayTicketDetails:()=>{},
    setDeleteColumn:()=>{},
    setProjects:()=>{},
    setDisplayCreateModal:()=>{},
    setDisplayCreateProject:()=>{},
    setConfirmDelete:()=>{},
    setEditProject:()=>{},
    setviewProject:()=>{},
});

interface MainContextproviderProps {
    children:ReactNode;
}

export const MainContextProvider = ({children}:MainContextproviderProps)=>{
    const [confirmDelete,setConfirmDelete]=useState({
        isOpen: false,
        projectId:'',
        projectName:'',
      });
      const [editProject,setEditProject]=useState({
        isOpen:false,
        Editingproject:null as null|Project
      });
      const [viewProject,setviewProject]=useState({
        isOpen:false,
        project:null as null|Project
      }); 
      const [displayCreateProject,setDisplayCreateProject]=useState(false);
      const [displayCreateModal,setDisplayCreateModal]=useState(false);
      const [projects,setProjects]=useState<Project[]>([]);
      const [deleteColumn,setDeleteColumn] = useState({
        Deleting:false,
        DeleteColumnId:'',
        StatusName:'',
      });
      const [displayTicketDetails,setDisplayTicketDetails]=useState<{
        displayDetails:boolean,
        ticketId:string,
      }>({
        displayDetails:false,
        ticketId:'', 
      });
      const [tickets,setTickets]=useState<Ticket[]>([]);

      const [ticket,setTicket] = useState<Ticket | null>(null);

const contextValue:MainContextType ={
    confirmDelete,
    editProject,
    viewProject,
    displayCreateProject,
    displayCreateModal,
    projects,
    deleteColumn,
    tickets,
    displayTicketDetails,
    ticket,
    setTicket,
    setDisplayTicketDetails,
    setTickets,
    setDeleteColumn,
    setProjects,
    setDisplayCreateModal,
    setDisplayCreateProject,
    setConfirmDelete,
    setEditProject,
    setviewProject,
}

return(
    <MainContext.Provider value={contextValue}>
        {children}
    </MainContext.Provider>
 );

}
