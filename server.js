const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = new Set();

io.on("connection", (socket) => {
    console.log('User is now connected');
    
    // Handle the join event
    socket.on('join', (userName) => {
        const cleanName = userName.trim();
        if (!cleanName) return;

        // Check if the username already exists
        if (users.has(cleanName)) {
            socket.emit('usernameTaken');
            return; // If username is taken, return and do not proceed
        }

        // Add the user to the set of users
        users.add(cleanName);
        socket.userName = cleanName;

        io.emit('userJoined', cleanName);
        io.emit('userList', Array.from(users));
    });

    // Handle incoming chat messages
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message); // Broadcast message to all clients
    });

    // Emit when a user is typing
socket.on('typing', (username) => {
    socket.broadcast.emit('userTyping', username);
  });
  
  // Emit when the typing stops (use timeout for this)
  socket.on('stopTyping', (username) => {
    socket.broadcast.emit('stopTyping', username);
  });
  

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("A User is disconnected", socket.userName);

        if (socket.userName) {
            users.delete(socket.userName);

            io.emit("userLeft", socket.userName);
            io.emit("userList", Array.from(users));
        }
    });
});

server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
