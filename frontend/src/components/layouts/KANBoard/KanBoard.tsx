import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useAppSelector } from "../../../Hooks";
import { TiUserAdd } from "react-icons/ti";
import { IoIosArrowDown } from "react-icons/io";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import {
  Apiconfig,
  StatusBaseApi,
  TicketBaseApi,
  UserBaseApi,
} from "../../Constants/ApiConstants";
import axios from "axios";
import { Ticket } from "../../../Types/TicketsType";
import { FaPlus } from "react-icons/fa6";
import { MainContext } from "../../../context/MainContext";
import { User } from "../../../Types/UserTypes";
import CreateQuickIssue from "./CreateQuickIssue";
import { IoIosWarning } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaArrowRight } from "react-icons/fa";
import IssueDetails from "./issueDetails/IssueDetails";
import { Status } from "../../../Types/StatusTypes";


const KanBoard = () => {
  const { user } = useAppSelector((state) => state.user);
  const {
    ticket,
    displayCreateModal,
    deleteColumn,
    setDeleteColumn,
    displayTicketDetails,
    setDisplayTicketDetails,
    tickets,
    setTickets,
  } = useContext(MainContext);
  const [focusedInput, setFocusedInput] = useState(false);
  const [displayGroupBy, setDisplayGroupBy] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("None");
  const { project } = useAppSelector((state) => state.project);

  const [hoveredTicket, setHoveredTicket] = useState("");
  const [displayTicketMenu, setDisplayTicketMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingIssue, setcreatingIssue] = useState({
    isCreating: false,
    forStatus: "",
    type: "task",
  });
  const TextareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const FormRef = useRef<HTMLFormElement>(null);
  const [issueTitle, setIssueTitle] = useState("");
  const [Loading, setLoading] = useState(false);
  const [quickIssueAssignedTo, setQuickIssueAssignedTo] = useState("");
  const [usersWithProjectAccess, setUsersWithProjectAccess] = useState<User[]>(
    []
  );
  const [creatingColumn, setCreatingcolumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const columnRef = useRef<HTMLInputElement>(null);
  const [editingColumn, setEditingColumn] = useState({
    editing: false,
    forID: "",
  });
  const [editedColumnName, setEditedColumnName] = useState("");
  const editColumnRef = useRef<HTMLInputElement>(null);

  const [moveStatusTo, setMoveStatusTo] = useState("");
  const [statuses, setStatuses] = useState<Status[]>([]);



  const handleOnDrag = (e: React.DragEvent,ticketId:string,ticketStatusId:string)=>{
    e.dataTransfer.setData('ticketId',ticketId);
    e.dataTransfer.setData('ticketStatusId',ticketStatusId);
  }

  const handleUpdateTicketStatus = async(ticketId:string, statusId: string,ticketStatusId:string)=>{
    if(ticketId && statusId && ticketStatusId){
      console.log('checking same Ticket Status');
      if(statusId!==ticketStatusId){
      try {
        console.log('Updating Ticket Status');
        setLoading(true);
        const Route = `${TicketBaseApi}/Update`;
        const { data } = await axios.post(Route, {id:ticketId,status:statusId}, Apiconfig);
        if(data){
          console.log('starting TicketFetch');
          await FetchTickets()
        }else{
          console.log('no Data, Status Update');
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }else{
      console.log('Same Status');
    }
    }
  }

  const handleOnDrop = async(e:React.DragEvent,statusId:string)=>{
    const ticketId = e.dataTransfer.getData('ticketId') as string;
    const ticketStatus = e.dataTransfer.getData('ticketStatusId') as string;
    if(ticketId && statusId && ticketStatus){
      console.log('ticketDropped:-',ticketId,'onStatus:-',statusId);
      await handleUpdateTicketStatus(ticketId,statusId,ticketStatus);
    }
  }

  const handleOnDragOver = (e:React.DragEvent)=>{
    e.preventDefault()
  }



  const FetchTickets = useCallback(async () => {
    if (user && project) {
      try {
        const Route = `${TicketBaseApi}/All`;
        const { data } = await axios.post(Route,{projectID:project._id,search:search}, Apiconfig);
        if (data && data.tickets) {
          setTickets(data.tickets as Ticket[]);
        } else {
          console.log(data,'error no tickets data');
        }
      } catch (error: any) {
        console.log(error);
      }
    }
  }, [user, project, search, displayCreateModal, ticket]);

  useEffect(() => {
    FetchTickets();
  }, [FetchTickets]);

  const HandleAddTicketToBin = async (ticketId: string) => {
    if (ticketId) {
      try {
        //console.log(ticketId,'id');
        const Route = `${TicketBaseApi}/Update`;
        const { data } = await axios.post(Route, { Bin: true,id:ticketId }, Apiconfig);
        if (data) {
          console.log(data);
          FetchTickets();
          setDisplayTicketMenu(false);
        } else {
          console.log("No Data Deleted");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (creatingIssue.isCreating) {
      if (TextareaRef.current) {
        TextareaRef.current.focus();
      }
    }
    if (creatingColumn) {
      if (columnRef.current) {
        columnRef.current.focus();
      }
    }
    if (editColumnRef) {
      if (editColumnRef.current) {
        editColumnRef.current.focus();
      }
    }
  }, [creatingIssue, creatingColumn, editingColumn]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (FormRef.current && !FormRef.current.contains(e.target)) {
        setcreatingIssue({
          forStatus: "",
          isCreating: false,
          type: "task",
        });
        setIssueTitle("");
        setQuickIssueAssignedTo("");
      }
      if (columnRef.current && !columnRef.current.contains(e.target)) {
        setCreatingcolumn(false);
        setNewColumnName("");
      }
      if (editColumnRef.current && !editColumnRef.current.contains(e.target)) {
        setEditingColumn({
          editing: false,
          forID: "",
        });
        setEditedColumnName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const FetchUsersWithprojectAccess = useCallback(async () => {
    if (project) {
      try {
        const Route = `${UserBaseApi}/All`;
        const { data } = await axios.post(Route,{projectID:project._id}, Apiconfig);
        if (data && data.success) {
          setUsersWithProjectAccess(data.UsersWithAccess as User[]);
        } else {
          console.log("no data user project access fetch");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [project]);

  const FetchStatuses = useCallback(async () => {
    if (project && user) {
      try {
        setLoading(true);
        const Route = `${StatusBaseApi}/All`;
        const { data } = await axios.post(Route,{ProjectId:project._id}, Apiconfig);
        if (data && data.success) {
          setStatuses(data.AllStatus as Status[]);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  }, [project, user]);

  useEffect(() => {
    FetchStatuses();
  }, [FetchStatuses]);

  const HandleCreateQuickIssue = async (e: any) => {
    e.preventDefault();
    if (
      issueTitle !== "" &&
      user &&
      project &&
      creatingIssue.forStatus !== "" &&
      creatingIssue.isCreating &&
      creatingIssue.type !== ""
    ) {
      try {
        setLoading(true);
        const CreateTicketData = {
          title: issueTitle,
          projectID: project._id,
          type: creatingIssue.type,
          assignedby: user._id,
          assignedTo: quickIssueAssignedTo !== "" ? quickIssueAssignedTo : "",
          status: creatingIssue.forStatus,
        };
        //console.log(CreateTicketData,'TicketData');
        const Route = `${TicketBaseApi}/Create`;
        const { data } = await axios.post(Route, CreateTicketData, Apiconfig);
        if (data && data.success) {
          //console.log(data,'submit');
          setcreatingIssue({
            forStatus: "",
            isCreating: false,
            type: "",
          });
          setIssueTitle("");
          setQuickIssueAssignedTo("");
          await FetchTickets();
        }
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        setcreatingIssue({
          forStatus: "",
          isCreating: false,
          type: "",
        });
        setIssueTitle("");
        setQuickIssueAssignedTo("");
        console.log(error);
      }
    } else {
      if (issueTitle === "") {
        if (TextareaRef && TextareaRef.current) {
          TextareaRef.current.focus();
        }
      } else if (creatingIssue.type === "") {
        if (selectRef && selectRef.current) {
          selectRef.current.focus();
          selectRef.current.style.border = "1px solid red";
          setTimeout(() => {
            if (selectRef && selectRef.current) {
              selectRef.current.style.border = "";
            }
          }, 2000);
        }
      }
      return;
    }
  };

  const HandleAddColumn = async (e: any) => {
    e.preventDefault();
    if (newColumnName !== "" && project) {
      try {
        const Route = `${StatusBaseApi}/Create`;
        const { data } = await axios.post(
          Route,
          { StatusName: newColumnName, ProjectId: project._id },
          Apiconfig
        );
        if (data && data.success) {
          await FetchStatuses();
          await FetchTickets();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const editColumn = async (statusId: string) => {
    if (statusId && editedColumnName !== "") {
      try {
        setLoading(true);
        const Route = `${StatusBaseApi}/Update`;
        const { data } = await axios.post(
          Route,
          { 
            StatusId:statusId,
            UpdatedStatusName: editedColumnName 
          },
          Apiconfig
        );
        if (data && data.success) {
          await FetchStatuses();
          await FetchTickets();
        } else {
          console.log("no Data update column");
        }
        setEditingColumn({
          editing: false,
          forID: "",
        });
        setEditedColumnName("");
        setLoading(false);
      } catch (error) {
        console.log(error);
        setEditingColumn({
          editing: false,
          forID: "",
        });
        setEditedColumnName("");
        setLoading(false);
      }
    }
  };

  const HandleDeleteColumn = async () => {
    if (
      deleteColumn.Deleting &&
      deleteColumn.DeleteColumnId !== "" &&
      deleteColumn.StatusName !== "" &&
      moveStatusTo !== ""
    ) {
      try {
        setLoading(true);
        const Route = `${StatusBaseApi}/Delete`;
        const { data } = await axios.post(
          Route,
          {
            statusID:deleteColumn.DeleteColumnId,
             moveStatusTo: moveStatusTo },
          Apiconfig
        );
        if (data && data.success) {
          await FetchStatuses();
          await FetchTickets();
        } else {
          console.log("no data delete column");
        }
        setDeleteColumn({
          DeleteColumnId: "",
          Deleting: false,
          StatusName: "",
        });
        setMoveStatusTo("");
        setLoading(false);
      } catch (error) {
        console.log(error);
        setDeleteColumn({
          DeleteColumnId: "",
          Deleting: false,
          StatusName: "",
        });
        setMoveStatusTo("");
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex overflow-hidden relative  flex-col gap-5 w-full h-screen text-white p-10">
      {displayTicketDetails.displayDetails &&
        displayTicketDetails.ticketId !== "" && <IssueDetails />}

      <div
        className={`${
          deleteColumn.Deleting &&
          deleteColumn.DeleteColumnId !== "" &&
          deleteColumn.StatusName !== ""
            ? ""
            : "hidden"
        } bg-green-800 absolute z-[999] left-56 top-20 w-full max-w-xl rounded-md p-4 min-h-[300px] flex flex-col items-center gap-10 `}
      >
        <div className={`flex items-center justify-between gap-2 w-full`}>
          <div className="flex gap-2 items-center">
            <IoIosWarning size={25} className="text-red-500" />
            <span className="font-bold lg:text-xl md:text-lg sm:text-base text-sm">
              Move Issues/Tickets From {deleteColumn.StatusName}
            </span>
          </div>

          <RxCross2
            size={20}
            onClick={() => {
              setDeleteColumn({
                DeleteColumnId: "",
                Deleting: false,
                StatusName: "",
              });
            }}
            className="hover:text-red-500 text-white transition-all duration-200 ease-in-out cursor-pointer"
          />
        </div>

        <div className="w-full justify-center items-center flex">
          <span className="underline">
            Select a new home for any issues/tickets with the{" "}
            {deleteColumn.StatusName} status.
          </span>
        </div>

        <div className="flex justify-around items-center w-full">
          <div className="flex flex-col gap-1">
            <h1>Status To Be Deleted :</h1>
            <span className="bg-green-600 p-2 rounded-md max-w-max text-white">
              {deleteColumn.StatusName}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1>Move existing issues/tickets to:</h1>
            <div className="flex gap-1 items-center">
              <FaArrowRight size={20} className="text-white" />
              <select
                disabled={Loading}
                value={moveStatusTo}
                onChange={(e) => setMoveStatusTo(e.target.value)}
                className="outline-none text-green-900 border-green-300 border-2 rounded-md p-2"
              >
                <option>Select</option>
                {statuses &&
                  statuses.map((status: any, i) => (
                    <option
                      key={status._id + i}
                      className={`${
                        status.StatusName !== deleteColumn.StatusName
                          ? ""
                          : "hidden"
                      }`}
                      value={status._id}
                    >
                      {status.StatusName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        {moveStatusTo !== "" && (
          <div className="w-full">
            <button
              disabled={Loading}
              onClick={() => {
                if (moveStatusTo !== "") {
                  HandleDeleteColumn();
                }
              }}
              className={`${
                Loading ? "animate-pulse" : ""
              } bg-green-700 hover:bg-green-600 transition-all duration-300 ease-in-out py-2 px-4 w-full rounded-md font-bold text-white`}
            >
              Move Tickets And Delete {deleteColumn.StatusName}
            </button>
          </div>
        )}
      </div>

      <h1 className="text-xl font-bold">KAN board</h1>

      <div className="flex w-full justify-between items-center">
        <div className="flex gap-5">
          <div
            className={`max-w-[300px] 
             border-2 rounded-md  p-2 flex items-center justify-between bg-transparent text-white`}
          >
            <input
              disabled={
                deleteColumn.Deleting &&
                deleteColumn.DeleteColumnId !== "" &&
                deleteColumn.StatusName !== ""
                  ? true
                  : false
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              className="w-[100px] focus:flex-1 bg-transparent
       transition-all duration-500 transform focus:w-[170px]  ease-in-out rounded-md px-2 outline-none placeholder:text-sm text-white  text-base"
              placeholder={`${focusedInput ? "Search this board" : ""}`}
            />
            <CiSearch size={20} color="white" className="" />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center -space-x-3">
              <button
                disabled={
                  deleteColumn.Deleting &&
                  deleteColumn.DeleteColumnId !== "" &&
                  deleteColumn.StatusName !== ""
                    ? true
                    : false
                }
                className="bg-secondary cursor-pointer rounded-full py-1 px-3 font-bold text-xl text-white"
              >
                {user ? user.FirstName.slice(0, 1) : "Login"}
              </button>
              <button
                disabled={
                  deleteColumn.Deleting &&
                  deleteColumn.DeleteColumnId !== "" &&
                  deleteColumn.StatusName !== ""
                    ? true
                    : false
                }
                className="bg-primary cursor-pointer rounded-full py-1 px-3 font-bold text-xl text-white"
              >
                F
              </button>
            </div>
            <div className="flex items-center cursor-pointer opacity-80 hover:opacity-100  bg-secondary rounded-full gap-1">
              <div className="flex justify-center   bg-secondary h-full rounded-full items-center py-2 px-3">
                <TiUserAdd size={22} className="" />
              </div>
              <button
                disabled={
                  deleteColumn.Deleting &&
                  deleteColumn.DeleteColumnId !== "" &&
                  deleteColumn.StatusName !== ""
                    ? true
                    : false
                }
                className="px-2"
              >
                Add people
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="flex items-center gap-3 relative">
            <h2 className="font-bold text-lg">Group By</h2>
            <button
              disabled={
                deleteColumn.Deleting &&
                deleteColumn.DeleteColumnId !== "" &&
                deleteColumn.StatusName !== ""
                  ? true
                  : false
              }
              onClick={() => setDisplayGroupBy(!displayGroupBy)}
              className=" bg-primary px-2  py-1 flex gap-1 items-center rounded-md"
            >
              <span>{selectedGroup}</span>
              <IoIosArrowDown
                size={15}
                className={`mt-1 ${
                  displayGroupBy ? "rotate-180" : "rotate-0"
                } transition-all duration-300 ease-in-out`}
              />
            </button>
            <div
              className={`${
                displayGroupBy ? "" : "hidden"
              } flex flex-col absolute bg-secondary z-[9999]  h-max rounded-md shadow-md right-0 top-[33px] w-max`}
            >
              <button
                onClick={() => {
                  setSelectedGroup("None");
                  setDisplayGroupBy(false);
                }}
                className="py-2 px-3  rounded-t-md border-b hover:bg-primary w-full"
              >
                None
              </button>
              <button
                onClick={() => {
                  setSelectedGroup("Assignee");
                  setDisplayGroupBy(false);
                }}
                className="py-2 px-3 border-b hover:bg-primary w-full"
              >
                Assignee
              </button>
              <button
                onClick={() => {
                  setSelectedGroup("SubTask");
                  setDisplayGroupBy(false);
                }}
                className="py-2 px-3 rounded-b-md  hover:bg-primary w-full"
              >
                SubTask
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${
          deleteColumn.Deleting &&
          deleteColumn.DeleteColumnId !== "" &&
          deleteColumn.StatusName !== ""
            ? "blur pointer-events-none"
            : ""
        }  flex min-w-full w-[800px] h-[490px] mb-8   gap-5 mt-5 overflow-auto pb-20 px-4`}
      >
        {statuses &&
          statuses.map((status, i) => (
            <div
              key={status.StatusName + i}
              onDrop={(e)=>handleOnDrop(e,status._id)}
              onDragOver={handleOnDragOver}
              className="bg-secondary py-2 h-max w-full min-w-[300px]  min-h-[160px] opacity-100 rounded-md flex flex-col gap-1"
            >
              <nav className="flex justify-between px-6 py-2 items-center">
                <div className="flex gap-1 items-center">
                  {editingColumn.editing &&
                  status._id === editingColumn.forID ? (
                    <input
                      ref={editColumnRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editedColumnName !== "") {
                          e.preventDefault();
                          editColumn(status._id);
                        }
                      }}
                      className="text-white font-bold px-2 py-2 bg-secondary rounded-sm  border"
                      type="text"
                      value={editedColumnName.toUpperCase()}
                      onChange={(e) => {
                        setEditedColumnName(e.target.value.toUpperCase());
                      }}
                    />
                  ) : (
                    <h1
                      onClick={() =>
                        setEditingColumn({ editing: true, forID: status._id })
                      }
                      className="font-semibold text-lg"
                    >
                      {status.StatusName}
                      {""}
                    </h1>
                  )}
                </div>
                <div
                  className={`px-2 relative py-1 cursor-pointer rounded-md transition-all ease-in-out ${
                    deleteColumn.Deleting &&
                    deleteColumn.DeleteColumnId === status._id
                      ? "bg-primary"
                      : "hover:bg-background"
                  } `}
                >
                  <PiDotsThreeOutlineFill
                    onClick={() => {
                      if (
                        deleteColumn.Deleting &&
                        deleteColumn.DeleteColumnId === status._id
                      ) {
                        setDeleteColumn({
                          ...deleteColumn,
                          DeleteColumnId: "",
                          Deleting: false,
                        });
                      } else {
                        setDeleteColumn({
                          ...deleteColumn,
                          DeleteColumnId: status._id,
                          Deleting: true,
                        });
                      }
                    }}
                    size={20}
                    className=""
                  />
                  <div
                    onClick={() => {
                      setDeleteColumn({
                        DeleteColumnId: status._id,
                        Deleting: true,
                        StatusName: status.StatusName,
                      });
                    }}
                    className={`${
                      deleteColumn.Deleting &&
                      deleteColumn.DeleteColumnId === status._id
                        ? ""
                        : "hidden"
                    } absolute z-[999] w-full min-w-max right-0 bg-primary p-2 rounded-sm hover:bg-background`}
                  >
                    <button className="text-white">
                      Delete {status.StatusName}
                    </button>
                  </div>
                </div>
              </nav>

              {/* Iterate over tickets for current status */}
              {tickets &&
                tickets.map((ticket) => (
                  <div
                  draggable
                  onDragStart={(e)=>handleOnDrag(e,ticket._id,ticket.status._id)}
                    key={ticket._id + ticket.status.StatusName}
                    className={`${
                      status._id === ticket.status._id ? "" : "hidden"
                    } bg-secondary px-2  py-2 h-max    rounded-lg flex flex-col  gap-2`}
                  >
                    <div
                      onMouseEnter={() => {
                        setHoveredTicket(ticket._id);
                      }}
                      onMouseLeave={() => {
                        setHoveredTicket("");
                        setDisplayTicketMenu(false);
                      }}
                      className="bg-primary  relative text-white gap-1 rounded-md  flex flex-col justify-center  w-full py-4 px-3"
                    >
                      {user && user.AccessProvided && (
                        <div
                          onClick={() => {
                            setDisplayTicketMenu(!displayTicketMenu);
                          }}
                          className={`${
                            hoveredTicket === ticket._id ? "" : "hidden"
                          } px-2 absolute bg-secondary flex justify-center items-center  rounded-md right-2 top-2 cursor-pointer opacity-80 hover:opacity-100 text-white`}
                        >
                          <PiDotsThreeOutlineFill
                            size={20}
                            className="text-white"
                          />
                        </div>
                      )}
                      {user && user.AccessProvided && (
                        <div
                          className={`${
                            displayTicketMenu && hoveredTicket === ticket._id
                              ? ""
                              : "hidden"
                          } absolute right-4 top-8 rounded-md py-1 min-w-[100px] bg-background`}
                        >
                          <button
                            onClick={() => HandleAddTicketToBin(ticket._id)}
                            className="text-sm font-semibold w-full hover:bg-primary "
                          >
                            Bin This Ticket
                          </button>
                        </div>
                      )}
                      <span
                        onClick={() => {
                          setDisplayTicketDetails({
                            displayDetails: true,
                            ticketId: ticket._id,
                          });
                        }}
                        className="hover:underline max-w-[80%] font-bold cursor-pointer opacity-80 hover:opacity-100"
                      >
                        {ticket.title}
                      </span>
                      <span className="bg-background w-max font-normal py-1 px-2 text-xs rounded-md">
                        {ticket.ticketName}
                      </span>
                    </div>
                  </div>
                ))}
              {creatingIssue.forStatus !== status._id ? (
                <div
                  onClick={() => {
                    setcreatingIssue({
                      forStatus: status._id,
                      isCreating: true,
                      type: "",
                    });
                    FetchUsersWithprojectAccess();
                  }}
                  className="w-full text-white hover:bg-primary flex items-center gap-3 px-4 font-bold py-1 cursor-pointer"
                >
                  <button>Create Issue</button>
                  <FaPlus size={20} />
                </div>
              ) : (
                <CreateQuickIssue
                  FormRef={FormRef}
                  HandleCreateQuickIssue={HandleCreateQuickIssue}
                  Loading={Loading}
                  TextareaRef={TextareaRef}
                  creatingIssue={creatingIssue}
                  issueTitle={issueTitle}
                  quickIssueAssignedTo={quickIssueAssignedTo}
                  selectRef={selectRef}
                  setIssueTitle={setIssueTitle}
                  setQuickIssueAssignedTo={setQuickIssueAssignedTo}
                  setcreatingIssue={setcreatingIssue}
                  user={user}
                  usersWithProjectAccess={usersWithProjectAccess}
                />
              )}
            </div>
          ))}

        <div className="bg-secondary py-2 h-max  min-h-[160px]  rounded-md flex flex-col gap-2">
          {creatingColumn ? (
            <div className="w-full flex px-5">
              <input
                ref={columnRef}
                className="text-white font-bold px-2 py-2 bg-transparent rounded-sm border"
                type="text"
                value={newColumnName}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newColumnName !== "") {
                    e.preventDefault();
                    HandleAddColumn(e);
                  }
                }}
                onChange={(e) => {
                  setNewColumnName(e.target.value);
                }}
              />
            </div>
          ) : (
            <div
              onClick={() => {
                setCreatingcolumn(true);
              }}
              className="w-full min-w-[250px] text-white hover:bg-primary flex items-center gap-3 px-4 font-bold py-1 cursor-pointer"
            >
              <button>Create New Column</button>
              <FaPlus size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanBoard;
