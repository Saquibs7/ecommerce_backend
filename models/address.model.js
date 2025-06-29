import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
    address_line:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:"india"
    },
    postalcode:{
        type:string,
        default:null
    },
    mobile:{
        type:string,
        default:null
    },
    status:{
        type:Boolean,
        default:true
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }

},
{
    timestamps:true
}
);
const AddressModel=mongoose.model("Address",addressSchema);
export default AddressModel;