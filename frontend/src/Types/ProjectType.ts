type CreatedBy={
    _id:string,
    FirstName:string,
    LastName:string,
    Email:string,
    Role:string,
    Approved: boolean,
    AccessProvided: boolean
}



export type Project = {
    ProjectName:string,
    _id:string,
    Description:string,
    StartDate:Date,
    EstimatedEndDate:Date,
    createdBy:CreatedBy,  // User who added the project to the platform. Null if it was added by an admin.
    createdAt:Date,
}

export interface ProjectState {
    loading:boolean,
    project:Project | null,
    error?:any
}