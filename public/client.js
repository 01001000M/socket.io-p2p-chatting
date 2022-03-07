
function auto_grow(){
    const ta = $(".msg_area").last()
    const scrollHeight = ta.prop("scrollHeight")
    ta.css("height","50px")
    ta.css("height",scrollHeight+"px");
    
}

const scrollToBottom = (e) => {
	e.scrollTop = e.scrollHeight;
}

const msgBox = document.getElementById("msgBox");
const users_list = document.getElementById("users_list");

const new_message = (direction,sender,msg)=>{
    return `
        <div class='message'>
            <p class="${direction}_color">${sender}</p>
            <textarea class='msg_area ${direction}' readonly>${msg}</textarea>
        </div>
    
    `;
}


$(document).ready(function(){
                //process outgoing messages

                $("#sending_form").on("submit",(e)=>{
                    e.preventDefault()
                    if(!$("#sending_message").val() || !$("input[name='myradio']:checked").attr('id') ){
                        $("#errArea").text("please fill the input and choose an user to send to ..");
                        setTimeout(() => {
                            $("#errArea").text("");
                        }, 4000);
                        return
                    }
                    
                    const message = $("#sending_message").val();

                    socket.emit("newMessage",{
                        sender:username,
                        target:$("input[name='myradio']:checked").attr('id'),
                        message:message
                    })
                    
                    msgBox.innerHTML += new_message('sent',username,message);
                    auto_grow();
                    $("#sending_message").val('');
                    scrollToBottom(msgBox)
                });

                //process incoming messages

                socket.on("resMessages",data=>{
                    
                    msgBox.innerHTML = '';
                    
                    if(data.length == 0){
                        return
                    }

                    data.map(obj => {
                        msgBox.innerHTML += new_message(obj.direction,obj.sender,obj.message);
                        auto_grow();
                    })

                    scrollToBottom(msgBox)
                    
                })

                //caching each sender with the amount of unreaded messages
                var left_messages_cache = {};

                socket.on("message",data=>{
                    if(document.getElementById(data.sender).checked){
                        msgBox.innerHTML += new_message("recieved",data.sender,data.message);
                        auto_grow();

                        scrollToBottom(msgBox)

                    }else{
                        if(!(data.target in left_messages_cache)){
                            left_messages_cache[data.target] = 1;
                        }else{
                            left_messages_cache[data.target] +=1;
                        }
                        document.getElementById(`notification:${data.sender}`).textContent = left_messages_cache[data.target];
                    }
                })

                //on radio button "myradio" state change request all messages between 
                //the sender and the target [which clicked]
                
                //that var for toggeling between users in connected_users bar (i hope you understand me !)
                var currently_checked = '';
                
                $('input[name="myradio"]').click(function(){
        
                    if($(this).attr('id') === currently_checked ){
                        $(this).prop("checked",false)
                        currently_checked = ''
                        return
                    }
                    
                    var targetID = $('input[name="myradio"]:checked').attr('id');
                    currently_checked = targetID
                    
                    socket.emit("reqMessages",{
                        target:targetID
                        })
                    //remove unreaded messages notification *when toggle*
                    left_messages_cache[targetID] = 0;
                    document.getElementById(`notification:${targetID}`).textContent = '';
                    scrollToBottom(msgBox)
                    

                    
                })

                
            });