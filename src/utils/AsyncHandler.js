

const AsyncHandler=(requestHandler)=>{
    (res,req,next)=>{
        Promise
        .resolve(requestHandler(res,req,next))
        .catch((err)=>next(err))
    }
}

export {AsyncHandler}
