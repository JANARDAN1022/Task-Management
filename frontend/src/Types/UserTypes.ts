type ProjectAccess = {
    _id:string,
    ProjectName:string
}

export interface User {
    FirstName:string | '',
    LastName:string | '',
    Email:string,
    MobileNumber:number,
    AadhaarNumber:Number,
    Role:string,
    Approved:boolean,
    AccessProvided:boolean,
    AppliedRole:string,
    ProjectAccess:ProjectAccess[],
    companies: [{
        company: string,
        role: string
    }],
    _id:string,
}

export interface UsersState {
    loading:boolean,
    isAuthenticated:boolean,
    user:User | null,
    error?:any
}

export interface RegisterData {
    FirstName:string,
    LastName:string,
    Email:string,
    Password:string,
    ConfirmPassword:string,
    AadhaarNumber:number,
    MobileNumber:number,
}

