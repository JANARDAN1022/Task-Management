type CreatedBy = {
    _id:string,
    FirstName:string,
    LastName:string,
    Email:string,
    Role:string,
    Approved: boolean,
    AccessProvided: boolean
}

export type Status = {
        _id: string,
        StatusName: string,
        Deleted: boolean,
        createdBy: CreatedBy,
        LastUpdatedBy: CreatedBy,
}