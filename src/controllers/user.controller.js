import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreeshTokens = async(userId)=>{
    try{
       const user =  await User.findById(userId)
       const accessToken =  user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()


       user.refreshToken = refreshToken
      await user.save({validateBeforeSave : false})   //mongodb se bnke aaya he to save method lga skte he
      
      return {accessToken,refreshToken}


    }
    catch (error){
        throw new ApiError(500, "something went wrong while generating refresh and acess token")

    }

}

const registerUser = asyncHandler(async(req,res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exist:username,email
    //check files - avatar,images
    //upload to cloudinary,avatar
   //create user object-create entry in db
   // remove password and refresh token field from  response
   //check for user creation 
   //return res


   const {username,email,fullName,password}=req.body
   console.log("password", password);
   console.log("avatrt", req.files)
   console.log("obdy",req.body);

   if(
    [fullName,email,username,password].some((field) =>
         field?.trim() === "" )
   ){
          throw new ApiError(400,"all fields are reqiured")
   }

   //console.log("files",req.files);


   const existedUser = await User.findOne({
    $or : [{username},{email}]
   });

   if(existedUser){
    throw new ApiError (409,"user with email or username alredy exists")
   }


   
    const avatarLocalPath = req.files?.avatar? req.files.avatar[0].path : null;     // first property me object milega jo multer ne file li server se uska
    const coverImageLocalPath = req.files?.coverImage ? req.files.coverImage[0].path : null;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     
    if(!avatar){
        throw new ApiError(500,"Avatar file is required")


    }
    let coverImageUrl = "";
    if (coverImageLocalPath) {
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (coverImage) {
            coverImageUrl = coverImage.url;
        } else {
            throw new ApiError(500, "Failed to upload cover image");
        } 
    }

    //console.log(req.files.avatar);


    const newUser = new User({
        fullName,
        avatar: avatar.url,
        coverImage: coverImageUrl,
        email,
        password,
        username: username.toLowerCase(),
    });

    // Save the new user to the database
    const createdUser = await newUser.save();
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return the user without sensitive fields
    const userWithoutSensitiveData = await User.findById(createdUser._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, userWithoutSensitiveData, "User registered successfully")
    );
});

// loginuser

// req body -> data lekr aana he
// username or login
// find user
// password check
// if pass match - > generate accss and refresh token
// send cookies( inme tokens he)


// koi field khali nhi honi chahiye
// match hona chahiye


const loginUser = asyncHandler(async(req,res) =>{

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"username or email required")
    }

   const user =  await User.findOne({
        $or:[{username} , {email}]
    })

    if(!user){
        throw new ApiError(404 , "user does not exist" )

    }

   const isPasswordValid =  await user.isPasswordCorrect(password)
 
   if(!isPasswordValid){
    throw new ApiError(401 , "wrong password" )

}

 const {accessToken,refreshToken} = await generateAccessAndRefreeshTokens(user._id)

 //object me update krna he ya database 
 //query marni he decide krna pdega


 //optional he - 
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   //cookies

   //taki sirf server se modify ho aur hr koi frontend se modify na kre
     const options ={
        httpOnly: true,
        secure: true
     }

     return res.
     status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,
                refreshToken  // jb user at ya rt ko save krna chahra ho
            },
            "User logged in successfully"
        )
     )
     
    })

   const logoutUser = asyncHandler(async(req,res)=>{
     //cookies aur refreshtoken clear krna pdega

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }

     )
     const options ={
        httpOnly: true,
        secure: true
     }

     return res
     .status(200)
     .clearCookies("accessToken",options)
     .clearCookies("refreshToken",options)
     .json(new ApiResponse(200,{},"User logged out"))
 })

//console.log(req.files , "errror")

 const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
   }
  
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
       const user = await User.findById(decodedToken?._id)
    
       if(!user){
        throw new ApiError(401,"invalid refresh token")
       }
       
       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired and used")
       }
    
       const options = {
        httpOnly:true,
         secure:true
       }
      const {accessToken,newrefreshToken} = await generateAccessAndRefreeshTokens(user._id)
    
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,option)
      .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "access token refreshed "
        )
      )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
 })


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} 