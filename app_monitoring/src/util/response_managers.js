export const ifFoundSend=(queryResult,message,res)=>{
    if(queryResult.rowCount==0){
        res.sendStatus(404);
    }


    res.send(message);
}