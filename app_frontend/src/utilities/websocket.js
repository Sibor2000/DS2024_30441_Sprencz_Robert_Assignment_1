let chatWebSocket = null;

export const connectChatWebSocket = (url) => {

    if(chatWebSocket){
        return
    }

    chatWebSocket = new WebSocket(url)

    chatWebSocket.onclose = () => {
        console.log("Connection closed")
    }
}

export const getWebSocket = () => {
    return chatWebSocket;
}