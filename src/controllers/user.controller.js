import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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

   console.log("files",req.files);


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

    console.log(req.files.avatar);


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

//console.log(req.files , "errror")

export {registerUser} 