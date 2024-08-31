import { Ticket } from "./TicketsType"

type PerformedBy = {
    _id:string,
    FirstName:string,
    LastName:string,
    Email:string,
    Role:string,
    Approved: boolean,
    AccessProvided: boolean
}

export type HistoryType = {
    updatedField:string,
    changes: {
        oldValue:{
            [value:string]:any
        },
        newValue: {
            [value:string]:any
        }
    },
    _id: string,
    eventName: string,
    eventItemType: string,
    action: string,
    performedBy:PerformedBy,
    createdAt: string,
    updatedAt: string,
}

export type TicketHistoryType = HistoryType & {
    eventItemId:Ticket
}