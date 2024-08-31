type AssignedBy = {
    _id:string,
    FirstName:string,
    LastName:string,
    Email:string,
    Role:string,
    Approved: boolean,
    AccessProvided: boolean
}

type parentTicket = {
    _id: string,
    title: string,
    type: string,
    ProjectId: string,
    description: string,
    status: string,
    ticketName: string,
    ticketNumber:number
}



export type Ticket = {
    _id: string,
    title: string,
    type: string,
    ProjectId: {
        _id: string,
        ProjectName: string
    },
    description: string,
    status: {
        _id: string,
        StatusName: string
    },
    labels: string[],
    attachments: string[],
    assignedby: AssignedBy,
    assignedTo: AssignedBy,
    parent:parentTicket,
    children:parentTicket[],
    ticketName: string,
    ticketNumber: number,
    estimatedTime:string,
    loggedTime:string,
    deleted: boolean,
    createdAt: Date,
    updatedAt: Date,
}


export type TicketsByStatus ={
    [statusName: string]: {tickets:Ticket[],statusId:string};
}


