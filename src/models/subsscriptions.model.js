import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,  //who is subscribing
        ref: "User"
    },
    channel:{
        type:Schema.Types.ObjectId, // channel owner
        ref:"User"
    }
},
{timestamps:true})


export const Subscription = mongoose.model("Subsrciption",subscriptionSchema)