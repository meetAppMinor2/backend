class apiError extends Error {
    constructor(message = "something went wrong", errors = [], statusCode, statck = "") {
        super(message);
        this.statusCode = statusCode;
        this.data=null;
        this.message = message;
        this.success=false;
        this.errors = errors;

        if(statck){
            this.statck = statck; 
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

export { apiError }