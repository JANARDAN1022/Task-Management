const UrlBase = `http://localhost:5000`;

export const ProjectBaseApi = `${UrlBase}/api/projects`;
export const TicketBaseApi = `${UrlBase}/api/tickets`;
export const UserBaseApi = ` ${UrlBase}/api/users`;
export const StatusBaseApi = `${UrlBase}/api/statusColumn`;
export const HistoryBaseApi = `${UrlBase}/api/history`;
export const CompanyBaseApi = `${UrlBase}/api/company`;
export  const Apiconfig = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  };
