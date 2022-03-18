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
io.on('connection', (socket,userData) => {
  var roomID= uuidv4();
  var startTime=new Date();  
  /**
   * Room
   */
    console.log(`${userData.userID} is connected lang : ${userData.lang}`);
    var isMatch=false;
    if(matchMap.size >= 1)
    {
      for (let [roomID, matchData] of matchMap) {
        const { userA, userB } = matchData;
        if(userA === userData.userID || userB === userData.userID){
          console.log(new Error(`${userData.userID} Repeat pairing`));
          isMatch=true;
          io.leave(socket.id);
          break;       
        }
      }
    }
    else if(dataMap.has(userData.userID))
    {
      console.log(new Error(`${userData.userID} Repeat connection`));
      io.leave(socket.id);
      break;
    }
    else
    {
      setDataMap(userData.userID,socket.id,userData.lang);

    }
    //if(!isMatch && !dataMap.has(userData.userID))setDataMap(socket.id, userData.userID,userData.lang);

    if(!isMatch && dataMap.size>1)
    {
      for (let [key, value] of dataMap) {
        const { lang } = value;
        if(key != userData.userID && lang === userData.lang){
          console.log(`match sucess ${key} and ${obj.userID}`);
          setMatchMap(userData.userID,key,roomID,lang, new Date().toISOString().slice(0, 19).replace('T', ' '));
          dataMap.delete(userData.userID);
          dataMap.delete(key);

          console.log("checkDataMap", dataMap);
          break;
        }/*else{
          console.log(`match fail ${obj.userID}`);
          //setMatchMap(obj.userID,user_id,roomID,lang)
        }*/
      }
      console.log("checkMatchMap", matchMap);

    }
    var processTime=new Date() - startTime;
    console.log(`processTime ${processTime}ms`);
    console.log("-----------------------------------------------------------------------------------------------------");

  /*socket.on('leave', (room) => {
    socket.leave(room)
    socket.to(room).emit('bye', room, socket.id)
    socket.emit('leave', room, socket.id)
  })*/
 
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
    origin: ["http://140.127.73.10.:8500"],
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

  function setMatchMap(userA,userB, roomID,lang,createTime) {
    matchMap.set(roomID, {
      userA: userA,
      userB:userB,
      lang: lang,
      createTime:createTime
    });
    console.log("setMatchMap", matchMap); 
}
