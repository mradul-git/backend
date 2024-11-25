import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {

        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true, //for searching {database me naam aajata he}
        },
           email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true, //for searching {database me naam aajata he}
        },
        avatar:{
            type:String, //cloudinary ki service use krnege
            required:true,
            },

        coverImage:{
            type:String,

        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video",

            }
        ],

        password:{
            type:String,
            required:[true,'Password is reqiured'],


        },
        refreshToken:{
            type:String,

        },


        },
{
    timestamps:true

}

)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
 return await   bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    }
    
)
}




export const User = mongoose.model("User",userSchema)