class ApiError extends Error{

    constructor(statuscode,
        message="something went wring",
        error = [],
        stack = ""
    ){
        super(message)
        this.statusCode = this.statusCode
        this.data = null
        this.message= message
        this.success = false;
        this.errors = error


        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}