module.exports =
    function() {
        var request = require('request');

        var host_local = 'http://localhost:3217/api/';
        var host_dev = 'https://api-dev.italkutalk.com/api/';
        //var host_dev = 'http://10.0.1.210/api/';
        // 發上去要改線上版網址不然會出錯
        var host_online = 'https://api.italkutalk.com/api/';

    //#region for jitsi
        this.getVideoID = async function (){
            var videoID = "";
            async function testAsync(){
                return new Promise((resolve,reject)=>{
                    this.fetch(host_online + 'webrtc/log',{
                            method:'GET'/*,
                            body:JSON.stringify({
                                mode:mode,
                                roomID:roomID,
                                userID:userID
                            })*/
                        }).then(function(response){ // 接收到回傳的物件
                            if(response.ok){ // 如果正確取得資料，沒有發生錯誤
                                return response.json(); // 將取得的資料，再使用 .json() 解析資料  
                            }
                            throw new Error(response.statusText);
                        }).then(function(data){  // 這裡真的取得資料：data
                            videoID = data.videoID;
                            resolve(videoID);
                            console.log("resolvevideoID",videoID)
                        }).catch(function(err) {
                            console.log("Failed to fetch page: ", err);
                        });       
                    });
            }
            async function asyncCall() {
                console.log('calling');
                var result = await testAsync();
                console.log('result7777',result); 
                return result;
            }  
            var temp = await asyncCall();
            console.log("temp",temp);
            return temp;
        };

       
    //#endregion
    };
