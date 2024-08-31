
type ProfileInfoCardProps = {
    Head:string,
    value:any,
    type:string,
    onChange:(e: any) => void
    displaySaveButton:boolean;
    onBlur: () => void;
    disabled:boolean
}

const ProfileInfoCard = ({Head,type,value,onChange,displaySaveButton,onBlur,disabled}:ProfileInfoCardProps) => {
  return (
    <div className="flex flex-col justify-center rounded-2xl bg-secondary bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
    <h1 className="text-sm text-white font-bold">{Head && Head} :</h1>
    <div className="w-full flex gap-2 items-center">
    {type  &&
    <input 
    onKeyDown={(e)=>{
        if(e.key==='Enter'){
            onBlur();
        }
    }}
    onBlur={onBlur}
    disabled={disabled}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={value?'':`your ${Head}`}
    className="text-base w-full outline-none py-2 bg-transparent font-medium text-white"/>
    }

        {displaySaveButton &&
        <button onClick={onBlur} className="bg-green-700 text-white text-sm rounded-md px-4 py-2 h-max opacity-80 hover:opacity-100 font-bold">Save</button>
         }
        </div>
  </div>
  )
}

export default ProfileInfoCard