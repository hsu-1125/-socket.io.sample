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

global.fetch = require("node-fetch");
var Global = require("./global.js");
var api = new Global();

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
  var startTime=new Date();
  console.log(`${socket.id} is connection`);  
  /**
   * Room
   */
    socket.emit('getUserData');
    //與前端取得使用者ˇ資料
    socket.on("getUserData", (userID,userLang) => {
      console.log(`getUserData userID : ${userID} lang : ${userLang}`);
      var isMatch=false;
      if(matchMap.size >= 1)
      {
        for (let [roomID, matchData] of matchMap) {
          const { userA, userB } = matchData;
          if(userA === userID || userB === userID){
            console.log(`${userData.userID} Repeat pairing`);
            isMatch=true;
            socket.disconnect();
            return;       
          }
        }
      }
      if(dataMap.has(userID) || isMatch)
      {
        console.log(`${userID} Repeat connection`);
        socket.disconnect();
        return;
      }
      else
      {
        setDataMap(userID,socket.id,userLang);
  
      }

  
      if(!isMatch && dataMap.size>1)
      {
        for (let [targetID, value] of dataMap) {
          const { lang,socketId } = value;
          if(targetID != userID && lang === userLang){
            const array=[socketId,socket.id];
            const roomID= uuidv4();
            const videoID= await api.getVideoID();
            console.log(`match sucess ${targetID} and ${userID}`);
            setMatchMap(userID,targetID,roomID,lang,videoID, new Date().toISOString().slice(0, 19).replace('T', ' '));
            for(const element of array)
            {
              socket.join(roomID);
            }
            dataMap.delete(userID);
            dataMap.delete(targetID);
            console.log("checkDataMap", dataMap);
            const members = io.sockets.adapter.rooms[roomID];
            console.log("joinRoomTest",members);
            return;
          }
        }
        console.log("checkMatchMap", matchMap);
  
      }
      var processTime=new Date() - startTime;
      console.log(`processTime ${processTime}ms`);
      console.log("-----------------------------------------------------------------------------------------------------");
  
    });
    //雙方配對成功，創建房間
    socket.on("create", (roomID,videoID,targetID,userID,lang) => {
      console.log(`server receive join from ${userID}`);
      api.webrtclog(roomID, userID); 
      const matchInfo = matchMap.get(roomID);
      if (matchInfo !== undefined) {
          console.log("room join roomID", roomID);
          io.to(roomID).emit("match", roomID,videoID,targetID,userID,lang);
          socket.join(roomID);

      } else { 
          socket.emit('finished');
          console.log(`server emit finished to ${userID}`);
      }
    });


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

 function setDataMap(userID, socketId,lang) {
  dataMap.set(userID, {
    socketId: socketId,
    lang:lang
  });
  console.log("setDataMap", dataMap);
}

  function setMatchMap(userA,userB, roomID,lang,videoID,createTime) {
    matchMap.set(roomID, {
      userA: userA,
      userB:userB,
      lang: lang,
      videoID:videoID,
      createTime:createTime
    });
    console.log("setMatchMap", matchMap); 
}
