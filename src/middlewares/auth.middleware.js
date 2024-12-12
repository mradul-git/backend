import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT  = asyncHandler(async(req,_,next)=>{     // jb koi situation me res khali ho to usko _ likh skte he
   try {
    const token = req.cookies?.accessToken  || req.header
     ("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new ApiError(401,
             "Unauthorized request")
     }
 
     const decodedtoken = jwt.verify(token,process.env.ACCES_TOKEN_SECRET)
      
     await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
       // TODO discuss about frontend
 
         throw new ApiError(401,"Invalid access token ")
     }
 
     req.user=user;
     next()
 
   } catch (error) {
    throw new ApiError(401,error?.message ||
        "Invalid access token")

   }


}) 
