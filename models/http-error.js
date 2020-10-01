class HttpError extends Error {
  constructor(message, errorCode, err, ip) {
    super(message);
    this.code = errorCode;

    // If err is passed, it will be logged on the console
    if (err) {
        console.log("\n")
        const currentdate = new Date(); 
        const datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
        if (ip) {
          console.log(`The following error occured on ${datetime}: while processing request from ip: ${ip}`);
        } else {
          console.log(`The following error occured on ${datetime}:`);
        }
        console.log(err);
        console.log("\n")
    }
}
}

module.exports = HttpError;
