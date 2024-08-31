import { RxCross2 } from "react-icons/rx";
import { MdEdit } from "react-icons/md";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../../../context/MainContext";
import { useAppSelector } from "../../../../Hooks";
import {
  Apiconfig,
  HistoryBaseApi,
  StatusBaseApi,
  TicketBaseApi,
  UserBaseApi,
} from "../../../Constants/ApiConstants";
import axios from "axios";
import { Status } from "../../../../Types/StatusTypes";
import { Ticket } from "../../../../Types/TicketsType";
import BasicDetails from "./BasicDetails";
import { TicketHistoryType } from "../../../../Types/HistoryType";
import { CiEdit } from "react-icons/ci";
import { User } from "../../../../Types/UserTypes";
import DisplayUsers from "./DisplayUsers";

const IssueDetails = () => {
  const { ticket, setTicket, setDisplayTicketDetails, displayTicketDetails } = useContext(MainContext);
  const { project } = useAppSelector((state) => state.project);
  const { user } = useAppSelector((state) => state.user);
  const [Loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [editTitle, setEditTitle] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const newTitleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [showActivity, setshowActivity] = useState({
    All: false,
    Comments: true,
    History: false,
  });
  const IssueDetailsRef = useRef<HTMLDivElement>(null);
  const [parentTickets, setParentTicket] = useState<Ticket[]>([]);
  const [displayParenttickets, setDisplayParenttickets] = useState(false);
  const [displayChildIssue, setDisplayChildIssue] = useState(false);
  const [chooseExistingIssues, setChooseExistingIssues] = useState(false);
  const NewChildIssueRef = useRef<HTMLInputElement>(null);
  const ExistingChildIssueRef = useRef<HTMLDivElement>(null);
  const parentTicketsRef = useRef<HTMLDivElement>(null);
  const [newChildIssueTitle, setNewChildIssueTitle] = useState("");
  const [newChildIssueType, setNewChildIssueType] = useState("");
  const selectTypeRef = useRef<HTMLSelectElement>(null);
  const [childrenTickets, setChildrenTickets] = useState<Ticket[]>([]);
  const childIssueSearchRef = useRef<HTMLInputElement>(null);
  const [searchChildrenTickets, setSearchChildrenTickets] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [ticketHistory,setTicketHistory]=useState<TicketHistoryType[]>([]);
const [ticketDebounce,setTicketDebounce]=useState<NodeJS.Timeout | null>(null);
const [pageNumber,setPageNumber]=useState(1);
const [showLoadMore,setShowLoadMore]=useState(false);
const [LoadUsers,setLoadUsers]=useState(false);
const [usersAvailable,setUsersAvailable]=useState<User[] | []>([]);
const [displayAssignTo,setDisplayAssignTo]=useState(false);
const [displayAssignBy,setDisplayAssignBy]=useState(false);
const scrollHistoryRef = useRef<HTMLDivElement>(null);
const [displayTypes,setDisplayTypes]=useState(false);


const FetchUsersWithprojectAccess = useCallback(async () => {
  if (project) {
    try {
      setLoadUsers(true);
      const Route = `${UserBaseApi}/All`;
      const { data } = await axios.post(Route,{projectID:project._id}, Apiconfig);
      if (data && data.success) {
        setUsersAvailable(data.UsersWithAccess as User[]);
      } else {
        console.log("no data user project access fetch");
      }
      setLoadUsers(false);
    } catch (error) {
      console.log(error);
      setLoadUsers(false);
    }
  }
}, [project]);

useEffect(()=>{
FetchUsersWithprojectAccess()
},[displayAssignBy]);



  const FetchTicketHistory = async()=>{
  if(ticket){
console.log('starting fetch');
    try {
      const Route = ` ${HistoryBaseApi}/ticket/specific`;
      const Body:{
        ticketId:string,
        page:number
      } = {
        ticketId:ticket._id,
        page:pageNumber
      }
      const {data} = await axios.post(Route,Body,Apiconfig);
      if(data && data.TicketHistory){
           console.log(data);
          setTicketHistory(data.TicketHistory as  TicketHistoryType[]);
         setShowLoadMore(data.hasNextPage);
         if(scrollHistoryRef && scrollHistoryRef.current){
          scrollHistoryRef.current.scrollTo({top:0,behavior:"smooth"})
         }
        }else{
          console.log('no data history ticket');
      }
  } catch (error) {
      console.log(error);
  }
  }
  }




  //Time Log 
  const [originalInputValue, setOriginalInputValue] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const OriginalEstimateRef = useRef<HTMLInputElement>(null);
  const ActualEstimateRef = useRef<HTMLInputElement>(null);

  const checkFormat = (input: string) => {
    return /^(\d+(\.\d+)?w)?\s?(\d+(\.\d+)?d)?\s?(\d+(\.\d+)?h)?\s?(\d+(\.\d+)?m)?$/.test(
      input
    );
  };

  const handleOriginalInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setOriginalInputValue(newValue);
  };

  const handleActualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setActualValue(newValue);
  };


  const calculateTime = (input: string, Type: string) => {
    const parts = input.match(
      /^(\d+(\.\d+)?w)?\s?(\d+(\.\d+)?d)?\s?(\d+(\.\d+)?h)?\s?(\d+(\.\d+)?m)?$/
    );

    if (!parts) {
      return;
    }

    let weeks = 0,
      days = 0,
      hours = 0,
      minutes = 0;

    // Parse input values with decimals
    if (parts[1] !== undefined) {
      weeks = parseFloat(parts[1]);
    }
    if (parts[3] !== undefined) {
      days = parseFloat(parts[3]);
    }
    if (parts[5] !== undefined) {
      hours = parseFloat(parts[5]);
    }
    if (parts[7] !== undefined) {
      minutes = parseFloat(parts[7]);
    }

    // Convert weeks to days and hours
    days += (weeks - Math.floor(weeks)) * 5; // 5 days in a week

    // Convert days with decimals to hours
    hours += (days - Math.floor(days)) * 8;

    // Convert hours with decimals to minutes
    minutes += (hours - Math.floor(hours)) * 60;

    // Round up minutes if in decimal form
    minutes = Math.ceil(minutes);

    // Normalize time
    weeks = Math.floor(weeks);
    days = Math.floor(days);
    hours = Math.floor(hours);
    minutes = Math.floor(minutes);

    // Convert excess minutes to hours
    hours += Math.floor(minutes / 60);
    minutes %= 60;

    // Convert excess hours to days
    days += Math.floor(hours / 8);
    hours %= 8;

    // Convert excess days to weeks
    weeks += Math.floor(days / 5);
    days %= 5;

    // Construct formatted time string
    const components = [];
    if (weeks > 0) components.push(`${weeks}w`);
    if (days > 0) components.push(`${days}d`);
    if (hours > 0) components.push(`${hours}h`);
    if (minutes > 0) components.push(`${minutes}m`);
    const formattedTime = components.join(" ");

    // Update state with the formatted time
    if (Type === "original") {
      setOriginalInputValue(formattedTime);
      HandleUpdateTicket("", "", "", formattedTime);
    } else if (Type === "actual") {
      setActualValue(formattedTime);
      HandleUpdateTicket("", "", "", "", formattedTime);
    }
  };

  const parseTime = (input: string) => {
    const parts = input.match(
      /^(\d+(\.\d+)?w)?\s?(\d+(\.\d+)?d)?\s?(\d+(\.\d+)?h)?\s?(\d+(\.\d+)?m)?$/
    );
    const time = { w: 0, d: 0, h: 0, m: 0 };
    if (!parts) return time;

    if (parts[1]) time["w"] = parseFloat(parts[1]);
    if (parts[3]) time["d"] = parseFloat(parts[3]);
    if (parts[5]) time["h"] = parseFloat(parts[5]);
    if (parts[7]) time["m"] = parseFloat(parts[7]);

    // Convert weeks with decimals to days
    time["d"] += (time["w"] - Math.floor(time["w"])) * 5;

    // Convert days with decimals to hours
    time["h"] += (time["d"] - Math.floor(time["d"])) * 8;

    // Convert hours with decimals to minutes
    time["m"] += (time["h"] - Math.floor(time["h"])) * 60;

    // Normalize time
    time["w"] = Math.floor(time["w"]);
    time["d"] = Math.floor(time["d"]);
    time["h"] = Math.floor(time["h"]);
    time["m"] = Math.floor(time["m"]);

    // Convert excess minutes to hours
    time["h"] += Math.floor(time["m"] / 60);
    time["m"] %= 60;

    // Convert excess hours to days
    time["d"] += Math.floor(time["h"] / 8);
    time["h"] %= 8;

    // Convert excess days to weeks
    time["w"] += Math.floor(time["d"] / 5);
    time["d"] %= 5;

    return time;
  };

  const calculateDifference = (original: string, actual: string) => {
    const originalTime = parseTime(original);
    const actualTime = parseTime(actual);

    let remainingTime: { w: number; d: number; h: number; m: number } = {
      w: 0,
      d: 0,
      h: 0,
      m: 0,
    };
    let surplusTime: { w: number; d: number; h: number; m: number } = {
      w: 0,
      d: 0,
      h: 0,
      m: 0,
    };

    // Calculate the total minutes for original and actual times
    const totalOriginalMinutes =
      originalTime.w * 7 * 8 * 60 +
      originalTime.d * 8 * 60 +
      originalTime.h * 60 +
      originalTime.m;
    const totalActualMinutes =
      actualTime.w * 7 * 8 * 60 +
      actualTime.d * 8 * 60 +
      actualTime.h * 60 +
      actualTime.m;

    // Check if actual time is greater than original time (surplus time)
    if (totalActualMinutes > totalOriginalMinutes) {
      let surplusMinutes = totalActualMinutes - totalOriginalMinutes;
      surplusTime.w = Math.floor(surplusMinutes / (7 * 8 * 60));
      surplusMinutes %= 7 * 8 * 60;
      surplusTime.d = Math.floor(surplusMinutes / (8 * 60));
      surplusMinutes %= 8 * 60;
      surplusTime.h = Math.floor(surplusMinutes / 60);
      surplusTime.m = surplusMinutes % 60;
    }

    // Calculate the difference in minutes
    let differenceMinutes = totalOriginalMinutes - totalActualMinutes;

    // Convert difference minutes to weeks, days, hours, and minutes
    remainingTime.w = Math.floor(Math.abs(differenceMinutes) / (7 * 8 * 60));
    differenceMinutes %= 7 * 8 * 60;
    remainingTime.d = Math.floor(Math.abs(differenceMinutes) / (8 * 60));
    differenceMinutes %= 8 * 60;
    remainingTime.h = Math.floor(Math.abs(differenceMinutes) / 60);
    remainingTime.m = Math.abs(differenceMinutes) % 60;

    // Format the remaining time
    const remainingComponents = [];
    if (remainingTime.w > 0) remainingComponents.push(`${remainingTime.w}w`);
    if (remainingTime.d > 0) remainingComponents.push(`${remainingTime.d}d`);
    if (remainingTime.h > 0) remainingComponents.push(`${remainingTime.h}h`);
    if (remainingTime.m > 0) remainingComponents.push(`${remainingTime.m}m`);
    const remainingValue = remainingComponents.join(" ");

    // Format the surplus time
    const surplusComponents = [];
    if (surplusTime.w > 0) surplusComponents.push(`${surplusTime.w}w`);
    if (surplusTime.d > 0) surplusComponents.push(`${surplusTime.d}d`);
    if (surplusTime.h > 0) surplusComponents.push(`${surplusTime.h}h`);
    if (surplusTime.m > 0) surplusComponents.push(`${surplusTime.m}m`);
    const surplusValue = surplusComponents.join(" ");

    // Set the timeLeft state based on remaining and surplus time
    if (remainingValue && surplusValue) {
      setTimeLeft(`${surplusValue} surplus`);
    } else if (remainingValue) {
      setTimeLeft(`${remainingValue} left`);
    } else {
      setTimeLeft("No Time Left");
    }
  };

  const HandleOnEnter = (For: string) => {
    if (For === "original") {
      if (checkFormat(originalInputValue) && originalInputValue !== "") {
        calculateTime(originalInputValue, "original");
      } else {
        if (OriginalEstimateRef && OriginalEstimateRef.current) {
          OriginalEstimateRef.current.style.borderColor = "red";
          setTimeout(() => {
            if (OriginalEstimateRef && OriginalEstimateRef.current)
              OriginalEstimateRef.current.style.borderColor = "white";
          }, 2000);
        }
      }
    } else if (For === "actual") {
      if (checkFormat(actualValue) && actualValue !== "") {
        calculateTime(actualValue, "actual");
      } else {
        if (ActualEstimateRef && ActualEstimateRef.current) {
          ActualEstimateRef.current.style.borderColor = "red";
          setTimeout(() => {
            if (ActualEstimateRef && ActualEstimateRef.current)
              ActualEstimateRef.current.style.borderColor = "white";
          }, 2000);
        }
      }
    }
  };

  const FetchTicket = useCallback(async () => {
    if (displayTicketDetails && displayTicketDetails.ticketId && project && user) {
      try {
        setLoading(true);
            //   console.log('Ticket Loading Started');
        const Route = `${TicketBaseApi}/Specific`;
        console.log(Route,'route fetching ticket');
        const { data } = await axios.post(Route,{id:displayTicketDetails.ticketId,ProjectId:project._id}, Apiconfig);
        //console.log(data,'data');
        if (data && data.success) {
          // console.log(data);
          setTicket(data.SpecificTicket as Ticket);
        }
        setLoading(false);
        //    console.log('Ticket Loading finished');
      } catch (error:any) {
        if (!error.response) {
          // Network error occurred
          console.error('Network error:', error);
          setLoading(false);
        } else{
        console.log(error);
        setLoading(false);
        }   // console.log('Ticket Loading Finished Error');
      }
    }else{
      setLoading(false);
    }
  }, [displayTicketDetails,displayTicketDetails.ticketId, project, user]);




  useEffect(() => {
    if (ticketDebounce) {
      console.log("cleared Fetch ticket specific Api call in que");
      clearTimeout(ticketDebounce); // Cancel previous debounce timeout
    }
    const timeoutId = setTimeout(FetchTicket, 500); // Debounce API call for 500ms
    setTicketDebounce(timeoutId);
  }, [FetchTicket]);

  const FetchStatuses = async () => {
    if (project && ticket) {
      setNewTitle(ticket.title);
    
      try {
        setStatusLoading(true);
          //console.log('Status Loading Started');
        const Route = `${StatusBaseApi}/All`;
        const { data } = await axios.post(Route,{ProjectId:project._id}, Apiconfig);
        if (data && data.success) {
          setStatuses(data.AllStatus as Status[]);
        }
        setStatusLoading(false);
         //console.log('status Loading finished');
      } catch (error) {
        console.log(error);
        setStatusLoading(false);
         //console.log('status Loading finished');
      }
    }
  };

  useEffect(() => {
    if (editTitle) {
      if (newTitleRef.current) {
        newTitleRef.current.focus();
      }
    }
    if (editDescription && ticket) {
      if (descriptionRef.current) {
        setNewDescription(ticket.description)
        descriptionRef.current.focus();
        // if(newDescription){
        // descriptionRef.current.setSelectionRange(0,newDescription.length);
        // }
      }
    }

    if (displayChildIssue) {
      if (NewChildIssueRef.current) {
        NewChildIssueRef.current.focus();
      }
    }

    if (chooseExistingIssues) {
      if (childIssueSearchRef.current) {
        childIssueSearchRef.current.focus();
      }
    }
  }, [editTitle, editDescription, displayChildIssue, chooseExistingIssues]);

  

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        IssueDetailsRef.current &&
        !IssueDetailsRef.current.contains(e.target)
      ) {
        setLoading(false);
        setNewTitle('');
        setEditTitle(false);
        setEditDescription(false);
        setNewDescription('');
        setDisplayTicketDetails({
          displayDetails: false,
          ticketId: '',
        });
        setTicket(null);
        setPageNumber(1);
      }

      if (
        ExistingChildIssueRef.current &&
        !ExistingChildIssueRef.current.contains(e.target)
      ) {
        setChooseExistingIssues(false);
        setSearchChildrenTickets('');
      }

      if (
        parentTicketsRef.current &&
        !parentTicketsRef.current.contains(e.target)
      ) {
        setDisplayParenttickets(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (ticket && !Loading) {
      if (ticket.estimatedTime) {
        setOriginalInputValue(ticket.estimatedTime);
      } else {
        setOriginalInputValue("");
      }
      if (ticket.loggedTime) {
        setActualValue(ticket.loggedTime);
      } else {
        setActualValue("");
      }
      if (ticket.estimatedTime && ticket.loggedTime) {
        calculateDifference(ticket.estimatedTime, ticket.loggedTime);
      } else if (ticket.estimatedTime && !ticket.loggedTime) {
        setTimeLeft(ticket.estimatedTime + " " + "Left");
      }
      if (!ticket.estimatedTime && !ticket.loggedTime) {
        setTimeLeft("No Time Logged");
      }
    }
  }, [ticket]);

  const HandleUpdateTicket = async (
    status?: string,
    Newparent?: string,
    Children?: string,
    estimatedTime?: string,
    loggedTime?: string,
    childrenIdRemoved?: string,
    removeParent? :boolean,
    assignedTo?:string,
    assignedby?:string,
    type?:string
  ) => {
    if (ticket) {
      let UpdatedData: {
        id:string,
        title?: string;
        description?: string;
        parent?: string;
        status?: string;
        children?: string;
        estimatedTime?: string;
        loggedTime?: string;
        childrenIdRemoved?: string;
        removeParent? :boolean;
        assignedTo?:string;
        assignedby?:string;
        type?:string;
      } = {
        id:ticket._id
      };


     if(type && type!=='epic' && ticket.type!==type){
      UpdatedData.type=type
     }


      if(assignedTo){
        if(ticket.assignedTo?._id){
          console.log(ticket.assignedTo,'existsTo');
          if(assignedTo!==ticket.assignedTo._id){
            UpdatedData.assignedTo=assignedTo     
           }
        }else{
          console.log('NOT existsTo');
        UpdatedData.assignedTo=assignedTo
        }
      }

      if(assignedby){
        if(ticket.assignedby?._id){
          console.log(ticket.assignedby,'exists');
          if(assignedby!==ticket.assignedby._id){
           UpdatedData.assignedby=assignedby     
          }
       }else{
        console.log('does not')
        UpdatedData.assignedby=assignedby
       }
      }

      if (newTitle && newTitle !== ticket.title) {
        UpdatedData.title = newTitle;
      }
      if ( newDescription !== ticket.description) {
        console.log(newDescription,'new desc');
        UpdatedData.description = newDescription;
      }else{

      }
      if (Newparent) {
       // console.log(Newparent, typeof Newparent);
        UpdatedData.parent = Newparent;
      }
      if (status && status !== ticket.status._id) {
        UpdatedData.status = status;
      }
      if (Children) {
          UpdatedData.children = Children;
      }
      if (childrenIdRemoved) {
        UpdatedData.childrenIdRemoved = childrenIdRemoved;
      }

      if (estimatedTime) {
        UpdatedData.estimatedTime = estimatedTime;
      }

      if (loggedTime) {
        UpdatedData.loggedTime = loggedTime;
      }

      if(removeParent){
        UpdatedData.removeParent = removeParent;
      }

      try {
       // console.log(UpdatedData, "data to update");
        setLoading(true);
        // console.log('Ticket Update Loading Started');
        // console.log(ticket.status._id,'statusid');
        const Route = `${TicketBaseApi}/Update`;
        console.log(UpdatedData,'data used here is');
        const { data } = await axios.post(Route, UpdatedData, Apiconfig);
        if (data && data.success && data.UpdatedTicket) {
          console.log(data.UpdatedTicket, "new");
          await FetchTicket();
          await FetchTicketHistory();
        } else {
        //  console.log("not updated no data");
        }
        setEditTitle(false);
        
        //console.log('Ticket Update Loading finished');

        setEditDescription(false);
        setDisplayParenttickets(false);
        setChooseExistingIssues(false);
        setLoading(false);
        setDisplayAssignTo(false);
        setDisplayAssignBy(false);
        setDisplayTypes(false);
      } catch (error) {
        setEditTitle(false);
        setEditDescription(false);
        setDisplayParenttickets(false);
        setChooseExistingIssues(false);
        setLoading(false);
        setDisplayAssignTo(false);
        setDisplayAssignBy(false);
        setDisplayTypes(false);
       // console.log("Ticket Update Loading finished error");
        console.log(error);
      }
    }
  };

  const FetchChildrenTickets = async () => {
    if (project && ticket) {
      try {
       // console.log('started Fetching');
        const Route = `${TicketBaseApi}/All/Relation`;
        const Body:{
          projectId:string,
          Relation:string,
          SelectedType:string,
          TicketId:string,
          Search:string,
          searchEnabled:boolean
        } = {
          projectId: project._id,
          Relation:'children',
          SelectedType:ticket.type,
          TicketId:ticket._id,
          Search:searchChildrenTickets,
          searchEnabled:true
        }
        const { data } = await axios.post(Route,Body,Apiconfig);
        if (data) {
          setChildrenTickets(data as Ticket[]);
        }
        //console.log('finished Fetching');
      } catch (error) {
        console.log(error, "ChildrenError");
      }
    }
  };

  const FetchParentTickets = useCallback(async () => {
    if (project && ticket && !Loading) {
      //console.log('started')
      try {
        const Route = `${TicketBaseApi}/All/Relation`;
        const Body:{
          projectId:string,
          Relation:string,
          SelectedType:string,
          TicketId:string,
        } = {
          projectId: project._id,
          Relation:'parent',
          SelectedType:ticket.type,
          TicketId:ticket._id,
        }
        
        const { data } = await axios.post(Route,Body,Apiconfig);
        if (data) {
          // console.log(data,'parentData');
          setParentTicket(data as Ticket[]);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error, "parentError");
      }
    }
  }, [project, ticket]);

  

  useEffect(() => {
    if (searchChildrenTickets && searchChildrenTickets.length >= 3) {
      if (debounceTimeout) {
        console.log("cleared Api call in que");
        clearTimeout(debounceTimeout); // Cancel previous debounce timeout
      }
      const timeoutId = setTimeout(FetchChildrenTickets, 500); // Debounce API call for 500ms
      setDebounceTimeout(timeoutId);
    } else {
      // if (debounceTimeout) {
      //    console.log('cleared Api call in que when legnth is below 3')
      //    clearTimeout(debounceTimeout); // Cancel previous debounce timeout
      //  }
      setChildrenTickets([]);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchChildrenTickets]);

  useEffect(() => {
    FetchParentTickets()
  }, [FetchParentTickets])

  const HandleCreateNewChildIssue = async (e: any) => {
    e.preventDefault();
    if (
      newChildIssueTitle !== "" &&
      ticket &&
      user &&
      project &&
      newChildIssueType !== ""
    ) {
      try {
        setLoading(true);
        const CreateTicketData = {
          title: newChildIssueTitle,
          projectID: project._id,
          type: newChildIssueType,
          assignedby: user._id,
          assignedTo: "",
          status: ticket.status,
          parent: ticket._id,
        };
        console.log(CreateTicketData,'TicketData');
        const Route = `${TicketBaseApi}/Create`;
        const { data } = await axios.post(Route, CreateTicketData, Apiconfig);
        if (data && data.success) {
          //console.log(data,'submit');
          await FetchTicket();
          await FetchTicketHistory();
        }
        setNewChildIssueTitle("");
        setNewChildIssueType("");
        setDisplayChildIssue(false);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        setNewChildIssueTitle("");
        setNewChildIssueType("");
        setDisplayChildIssue(false);
        console.log(error);
      }
    } else {
      if (newChildIssueTitle === "") {
        if (NewChildIssueRef && NewChildIssueRef.current) {
          NewChildIssueRef.current.focus();
        }
      } else if (newChildIssueType === "") {
        if (selectTypeRef && selectTypeRef.current) {
          selectTypeRef.current.focus();
          selectTypeRef.current.style.border = "1px solid red";
          setTimeout(() => {
            if (selectTypeRef && selectTypeRef.current) {
              selectTypeRef.current.style.border = "";
            }
          }, 2000);
        }
      }
      return;
    }
  };

  return user && ticket ? (
    <div
      ref={IssueDetailsRef}
      className={` bg-white   flex flex-col gap-2 absolute left-10 top-0  text-black w-full max-w-6xl max-h-[600px] min-h-max  rounded-md shadow-md z-[9999] p-2`}
    >
      <div
        className={`${
          Loading ? "animate-pulse pointer-events-none" : ""
        } flex w-full justify-between px-4 items-center py-2`}
      >
        <span className="flex relative gap-2 items-center">
          {ticket.type !== "epic" &&
            parentTickets &&
            parentTickets.length > 0 && (
              <div
                ref={parentTicketsRef}
                className={`${
                  displayParenttickets ? "" : "hidden"
                } absolute top-6 z-[999] min-h-[50px] shadow-md border left-[-5px] bg-green-600 py-2 min-w-[130px] flex flex-col rounded-sm`}
              >
                {parentTickets &&
                  parentTickets.length > 0 &&
                  parentTickets.map((parent) => (
                    <button
                      key={parent._id}
                      onClick={() => {
                        console.log(parentTickets);
                        HandleUpdateTicket("", parent._id);
                      }}
                      className="text-white font-bold opacity-80 hover:opacity-100 hover:bg-green-900 cursor-pointer hover:underline w-full min-w-full text-center"
                    >
                      {parent.ticketName}
                    </button>
                  ))}
                 {ticket.parent && 
                 <div className="p-2 flex flex-col items-center">
                 <button onClick={()=>HandleUpdateTicket('','','','','','',true)}>Remove Parent</button>
                 </div>
                 } 
              </div>
            )}
          {ticket.type === "epic" ? null : ticket.parent ? (
            <button
              onClick={() => setDisplayParenttickets(!displayParenttickets)}
              className="flex hover:underline gap-1 items-center"
            >
              <MdEdit size={15} className="" />
              {ticket.parent.ticketName}
            </button>
          ) : (
            <button
              onClick={() => setDisplayParenttickets(!displayParenttickets)}
              className="flex hover:underline gap-1 items-center"
            >
              <MdEdit size={15} className="" />
              <span> Add a Parent </span>
            </button>
          )}
          {ticket.type !== "epic" && "/"}{" "}
          <span className="">{ticket.ticketName}</span>
        </span>
        <RxCross2
          className="cursor-pointer"
          size={20}
          onClick={() => {
            setPageNumber(1);
            setDisplayTicketDetails({
              displayDetails: false,
              ticketId: "",
            });
            setLoading(false);
            setNewTitle('');
            setEditTitle(false);
            setEditDescription(false);
            setNewDescription('');
            setTicket(null);
          }}
        />
      </div>

      <div
        className={`${
          Loading ? "animate-pulse pointer-events-none" : ""
        } justify-between  flex w-full min-h-full`}
      >
        <BasicDetails
        scrollHistoryRef={scrollHistoryRef}
        setShowLoadMore={setShowLoadMore}
         setTicketHistory={setTicketHistory}
        showLoadMore={showLoadMore}
         page={pageNumber}
         setPageNumber={setPageNumber}
        ticketHistory={ticketHistory}
        FetchTicketHistory={FetchTicketHistory}
          searchChildrenTickets={searchChildrenTickets}
          setSearchChildrenTickets={setSearchChildrenTickets}
          setNewChildIssueType={setNewChildIssueType}
          newChildIssueType={newChildIssueType}
          selectTypeRef={selectTypeRef}
          newDescription={newDescription}
          descriptionRef={descriptionRef}
          HandleUpdateTicket={HandleUpdateTicket}
          NewChildIssueRef={NewChildIssueRef}
          displayChildIssue={displayChildIssue}
          editDescription={editDescription}
          editTitle={editTitle}
          newTitle={newTitle}
          newTitleRef={newTitleRef}
          setDisplayChildIssue={setDisplayChildIssue}
          setEditDescription={setEditDescription}
          setEditTitle={setEditTitle}
          setNewDescription={setNewDescription}
          setNewTitle={setNewTitle}
          ticket={ticket}
          ExistingChildIssueRef={ExistingChildIssueRef}
          childIssueSearchRef={childIssueSearchRef}
          childrenTickets={childrenTickets}
          newChildIssueTitle={newChildIssueTitle}
          setNewChildIssueTitle={setNewChildIssueTitle}
          HandleCreateNewChildIssue={HandleCreateNewChildIssue}
          chooseExistingIssues={chooseExistingIssues}
          setChooseExistingIssues={setChooseExistingIssues}
          setshowActivity={setshowActivity}
          showActivity={showActivity}
          user={user}
        />

        <div className="flex flex-col gap-2 flex-1 px-4 pb-4">
          {ticket.status._id ? (
            <div className="flex items-center gap-2 w-full">
              <select
                onClick={() => {
                  if (statuses.length === 0) {
                    FetchStatuses();
                  }
                }}
                onChange={(e) => {
                  HandleUpdateTicket(e.target.value);
                }}
                className="p-2 bg-background text-white font-bold"
                value={ticket.status._id}
              >
                {statuses && statuses.length > 0 && !statusLoading ? (
                  statuses.map((status) => (
                    <option
                      className={``}
                      key={status._id + status.StatusName}
                      value={status._id}
                    >
                      {status.StatusName}
                    </option>
                  ))
                ) : (
                  <>
                    <option className="">{ticket.status.StatusName}</option>
                    <option className="invisible font-bold">IN PROGRESS</option>
                  </>
                )}
              </select>

              <div className="p-2 bg-background text-white font-bold flex items-center gap-2">
              {displayTypes && ticket.type!=='epic' && ticket.type!=='subTask'?
              <select 
              className="px-2 bg-background text-white font-bold"
                value={ticket.type}
                onChange={(e)=>HandleUpdateTicket('','','','','','',undefined,'','',e.target.value)}
              >
                <option value='task'>Task</option>
                
                <option value='story'>Story</option>
                
                </select>
              :
              <div className="flex items-center gap-2">
                <span>{ticket.type.toUpperCase()}</span>
                {ticket.type!=='epic' && ticket.type!=='subTask' &&
                <CiEdit onClick={()=>setDisplayTypes(true)} size={20} className="cursor-pointer hover:opacity-100 opacity-80"/>
}
                </div>
              }
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <select className="animate-pulse p-2 bg-background" />
            </div>
          )}

          <div className="border w-full h-full  flex flex-col  border-white">
            <div className="bg-secondary py-4 px-4">
            <div className="w-full h-full bg-background text-white">
            <div className="w-full border-b p-2 border-b-white">
              <h1>Details</h1>
            </div>
            <div className="flex flex-col w-full p-4 gap-4 items-center">
              <div className="w-full relative select-none justify-between pr-4 items-center  flex">
                <span>Assignee</span>
                <div className="flex items-center gap-2">
                <span>
                  {ticket.assignedTo?.FirstName
                    ? ticket.assignedTo.FirstName
                    : "Unassgined"}
                </span>
                <CiEdit className="cursor-pointer" size={20} onClick={()=>{
                   setDisplayAssignBy(false);
                  setDisplayAssignTo(!displayAssignTo);
                }}/>
                </div>

                {displayAssignTo && 
                 <DisplayUsers 
                 HandleUpdateTicket={HandleUpdateTicket}
                 LoadingUsers={LoadUsers}
                 usersAvailable={usersAvailable}
                 displayAssignTo={displayAssignTo}
                 />
                }

              </div>
              <div className="w-full select-none relative justify-between pr-4 items-center  flex">
                <span>Assigned By</span>
                <div className="flex items-center gap-2">
                <span>{ticket.assignedby?.FirstName}</span>
                <CiEdit className="cursor-pointer" size={20}  onClick={()=>{
                  setDisplayAssignTo(false);
                  setDisplayAssignBy(!displayAssignBy);
                }}/>
                </div>

                {displayAssignBy && 
                 <DisplayUsers 
                 HandleUpdateTicket={HandleUpdateTicket}
                 LoadingUsers={LoadUsers}
                 usersAvailable={usersAvailable}
                 displayAssignBy={displayAssignBy}
                 />
                }

              </div>
              <div className="w-full justify-between pr-10 items-center  flex">
                <span>Labels</span>
                <span>
                  {ticket.labels?.length > 1
                    ? ticket.labels.map((label) => label)
                    : "None"}
                </span>
              </div>
              <div className="w-full justify-between pr-10 items-center  flex">
                <span>Parent</span>
                <span>{ticket.parent ? ticket.parent.ticketName : "None"}</span>
              </div>

              <div className="w-full justify-between  items-center text-sm  flex">
                <span>Original estimate</span>
                <input
                  ref={OriginalEstimateRef}
                  type="text"
                  onBlur={()=>{
                    if(ticket && ticket.estimatedTime){
                      setOriginalInputValue(ticket.estimatedTime)
                    }
                    }}
                  className="border outline-none  px-2 py-1  text-white placeholder:text-white bg-transparent  font-bold text-sm  rounded-md w-[140px]"
                  value={originalInputValue}
                  onChange={handleOriginalInputChange}
                  disabled={Loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      HandleOnEnter("original");
                    }
                  }}
                  placeholder="2w 4d 6h 45m"
                  maxLength={15}
                />
              </div>

              <div className="w-full justify-between  items-center  flex">
                <span>Actual Time </span>
                <input
                  ref={ActualEstimateRef}
                  type="text"
                  onBlur={()=>{
                  if(ticket && ticket.loggedTime){
                    setActualValue(ticket.loggedTime)
                  }
                  }}
                  className="border  outline-none px-2 py-1  text-white placeholder:text-white bg-transparent  font-bold text-sm  rounded-md w-[140px]"
                  value={actualValue}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      HandleOnEnter("actual");
                    }
                  }}
                  onChange={handleActualChange}
                  disabled={Loading}
                  placeholder="2w 4d 6h 45m"
                  maxLength={15}
                />
              </div>

              <div className="w-full justify-between pr-10 items-center  flex">
                <span>Time tracking</span>
                <div className="flex flex-col">
                  <span>
                    {timeLeft} {!timeLeft && "No Time Logged"}
                  </span>
                </div>
              </div>
            </div>
            </div>
            </div>
          </div>

          <div className="flex flex-col  gap-2 items-center">
            <span>
              Created on : {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
            <span>
              Last Update on: {new Date(ticket.updatedAt).toLocaleDateString()}{" "}
              {new Date(ticket.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      ref={IssueDetailsRef}
      className={` min-h-[500px] bg-white  flex flex-col gap-2 absolute left-20 top-5  text-black w-full max-w-6xl max-h-[600px] rounded-md shadow-md z-[9999] p-2`}
    >
      <div className="animate-pulse w-full h-full justify-center items-center flex">
        Fetching Ticket
      </div>
    </div>
  );
};

export default IssueDetails;
