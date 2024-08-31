
type IssueDataProps = {
    head:string,
    value:string
}

const IssueData = ({head,value}:IssueDataProps) => {
  return (
    <div className="flex flex-col gap-1 items-center">           
           <span className="hover:underline  max-w-full font-bold cursor-pointer opacity-80 hover:opacity-100">{head}:</span>
           <span className="bg-background w-max font-normal py-1 px-2 text-xs rounded-md">{value}</span>
          </div>
  )
}

export default IssueData