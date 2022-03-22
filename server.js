const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
const dataMap = new Map(); //正常連線後，儲存 socket.id 對應到的 userID 及 roomID，斷線後清除
const callingSet = new Set(); //成功通話後，儲存 socket.id，發送 leave 後清除，用於判斷突然斷線的使用者
const matchMap=new Map();
let room = "no1";
const { v4: uuidv4 } = require('uuid');

/**
 * 路由
 */
 app.get("/", function (req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.end("hello world");
});

app.get('/a', (req, res) => {
    res.sendFile(__dirname + '/clientA.html');
  });

app.get('/b', (req, res) => {
    res.sendFile(__dirname + '/clientB.html');
});

/**
 * socket 事件
 */
io.on('connection', (socket) => {
  var roomID= uuidv4();
  var startTime=new Date();
  /*console.log(`${socket.id} connected`);
  console.log(`${roomID} connected`);*/

  
  /**
   * Room
   */
  socket.on('message', (data) => {
    var obj = JSON.parse(data)
    console.log(obj.userID + ":" + obj.message)
    io.in(room).emit('room', JSON.stringify(obj))
  })

  socket.on('join', (json) => {
    var obj = JSON.parse(json);
    console.log(`${obj.userID} is connected lang : ${obj.lang}`);
    var isMatch=false;
    if(matchMap.size>=1)
    {
      for (let [roomID, matchData] of matchMap) {
        const { userA, userB } = matchData;
        if(userA===obj.userID||userB===obj.userID){
          console.log(`${obj.userID} isMatched`);
          isMatch=true;
          break;       
        }
      }
    }

    if(!isMatch && !dataMap.has(obj.userID))setDataMap(socket.id, obj.userID,obj.lang);

    if(!isMatch && dataMap.size>1)
    {
      for (let [user_id, userData] of dataMap) {
        const { lang } = userData;
        if(user_id!=obj.userID&&lang===obj.lang){
          console.log(`match sucess ${user_id} and ${obj.userID}`);
          setMatchMap(obj.userID,user_id,roomID,lang, new Date().toISOString().slice(0, 19).replace('T', ' '));
          dataMap.delete(obj.userID);
          dataMap.delete(user_id);

          console.log("checkDataMap", dataMap);
          break;
        }/*else{
          console.log(`match fail ${obj.userID}`);
          //setMatchMap(obj.userID,user_id,roomID,lang)
        }*/
      }
      console.log("checkMatchMap", matchMap);

    }
    var processTime=new Date()-startTime;
    console.log(`processTime ${processTime}ms`);
    console.log("-----------------------------------------------------------------------------------------------------");
  })

  socket.on('leave', (room) => {
    socket.leave(room)
    socket.to(room).emit('bye', room, socket.id)
    socket.emit('leave', room, socket.id)
  })
 
  /**
   * 全體廣播
   */
  // socket.on('message', (data) => {
  //   var obj = JSON.parse(data)
  //   console.log(obj.userID + ":" + obj.message)
  //   io.emit('all', data)
  // })
});

app.use(
  cors({
    //origin: ["https://f5a4-140-124-73-27.ngrok.io"],
    origin: ["http://140.127.73.10:8500"],
  })
);

/**
 * 連線 port 設定
 */
 app.set("port", process.env.PORT || 8500);

 server.listen(app.get("port"), function () {
   console.log("Express server listening on port " + app.get("port"));
 });

 function setDataMap(socketId, userID,lang) {
  dataMap.set(userID, {
    socketId: socketId,
    lang:lang
  });
  console.log("setDataMap", dataMap);
}

  function setMatchMap(userA,userB, roomID,lang,createTime) {
    matchMap.set(roomID, {
      userA: userA,
      userB:userB,
      lang: lang,
      createTime:createTime
    });
    console.log("setMatchMap", matchMap);
  }
