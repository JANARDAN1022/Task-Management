export interface Company {
    _id:string,
   name:string,
   description:string,
   projects:string[],
   members:[
    {
        user:string,
        role:string
    }
   ],
   createdAt:Date,
   createdBy:string
}

export interface CompanyState {
    loading:boolean,
    company:Company | null,
    error?:any
}