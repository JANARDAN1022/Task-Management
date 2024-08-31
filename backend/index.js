require('dotenv').config({path:"C:/Users/janar/OneDrive/Desktop/internship-tracker/backend/developmentConfig/devConfig.env"});
const app = require('./app.js');
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

require('./developmentConfig/devDatabase.js');


const Port = process.env.PORT || 4000;
const HostName = process.env.HOSTNAME;



// Start the Express app
const io = require('socket.io')(app.listen(Port, HostName, (err) => {
  if (err) throw err;
  console.log(`Server is running at http://${HostName}:${Port}`);
}),{
  cors: {
    origin:['http://localhost:5173'],// frontend URL
    credentials: true,
  }
})



let activeUsers = []; // Change to let, as this variable will be updated

io.on("connection", (socket) => {
console.log("A socket connected:", socket.id);
  
  socket.on("user-connected", (newUserId,isMarked,startHour,endHour) => {
    console.log("User connected with UserID:",newUserId);
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
        isMarked: isMarked, 
        startHour:startHour,
        endHour:endHour,
      });
    }
    io.emit("get-users", activeUsers);

    //on exit and other socket func here add later
  });
});

function isInWorkHours(startHour, endHour) {
  const currentHour = new Date().getHours();
  return currentHour >= startHour && currentHour <= endHour;
}

function sendNotification(userId, message) {
  const user = activeUsers.find(user => user.userId === userId);
  if (user) {
    io.to(user.socketId).emit('notification', { message });
  }
}

// every 5 minutes notification
setInterval(() => {
  activeUsers.forEach(user => {
    if (!user.isMarked) {
      console.log('sent noti')
      sendNotification(user.userId, "Reminder: You have not marked your attendance!");
    }
  });
}, 5 * 60 * 1000);
