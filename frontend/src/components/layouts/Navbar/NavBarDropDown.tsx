import React from 'react';
import { RxCross2 } from "react-icons/rx";
import { useAppSelector } from '../../../Hooks';

type Field = {
    Field:string,
    onClickFunc?:()=>void;   
}

type NavBarDropDownProps = {
    showMenu:string;
    setShowMenu: (value: React.SetStateAction<string>) => void;
    ShowMenuCheck:string;
    Fields:Field[];
}

const NavBarDropDown = ({setShowMenu,showMenu,ShowMenuCheck,Fields}:NavBarDropDownProps) => {
    const {user} = useAppSelector((state)=>state.user);
  return (
    <div className={`${showMenu===ShowMenuCheck?`absolute ${ShowMenuCheck === 'ProfileMenu'?'top-10':'top-7'}  right-0 z-50 opacity-100 w-max min-w-[120px]`:'hidden'} flex flex-col  text-white font-bold z-50 pt-2  rounded-md w-[150px] bg-background shadow shadow-gray-500`}>
    <div className="flex justify-between items-center w-full pl-5 pr-2 border-b border-b-white py-2">
    <span className="font-bold">{ShowMenuCheck === 'ProfileMenu'? user?.FirstName:ShowMenuCheck}</span>
    <RxCross2 onClick={()=>{
      setShowMenu('')
      }} size={20} className="opacity-70 hover:opacity-100 cursor-pointer"/>
    </div>

    {Fields && Fields.map((Fields,i)=>(
      Fields.Field==='Create New Project'?
    <button key={i} disabled={!user || (user &&  !user.Approved || !user.AccessProvided)} className={`${user && user.AccessProvided?'':'hidden'} p-2 w-full  hover:bg-primary  rounded-md font-bold opacity-70 hover:opacity-100 `} onClick={Fields.onClickFunc?Fields.onClickFunc:()=>{}}>{Fields.Field}</button>  
      :
      <button key={i} disabled={!user || (user &&  !user.Approved)} className={` p-2 w-full hover:bg-primary   font-bold opacity-70 hover:opacity-100`} onClick={Fields.onClickFunc?Fields.onClickFunc:()=>{}}>{Fields.Field}</button>  
    ))}
    </div>
  )
}

export default NavBarDropDown