import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { EmailAuthCredential } from "firebase/auth/web-extension";

import * as validators from "./validators.mjs";
const PORT = 8000;
const MONGOURL = 'mongodb://localhost:27017/venueBooking';

const app = express();
app.use(cors());
app.use(express.json());

//----------------DATABASE--------------------
//CONNECTION
mongoose.connect(MONGOURL)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log('App Connected to port')
    })
  })
  .catch(error => {
    console.log('Error occured')
  })

//USER TO ROLE MODEL
const userToRoleSchema = new mongoose.Schema({
    userId:{
      type        :String,
      required    :true
    },
    name:{
      type        :String,
      required    :true
    },
    role:{
      type        :String,
      required    :true
    },
    email:{
      type        :String,
      required    :true
    },
    department:{
      type        :String,
      required    :true
    },
    mobileNumber:{
      type        :String,
      required    :true
    }
} , {collection : "user_role"});
userToRoleSchema.index({userId:1} , {unique:true});
const userToRoleModel = new mongoose.model('user_role' , userToRoleSchema , 'user_role');
//VENUES MODEL
const venueSchema = new mongoose.Schema({
  venueId:{
    type    :String,
    required:true
  },
  managerId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'user_role'
  },
  availabilityStatus:{
    type    :Boolean,
    required:true
  },
  capacity:{
    type    :BigInt,
    required:true,
    validate:{
      validator:validators.testValidator,
      message:  "Capacity must be between 1 and 1000"
    }
  },
  name:{
    type    :String,
    required:true,
  },
  blockDetails:{
    type    :String,
    required:true,
  }
} , {collection : 'venue' , index : {managerId : 1 , unique:true}});
const venueModel = new mongoose.model("venue" , venueSchema , "venue");
//AMENITIES
const amenitiesSchema = new mongoose.Schema({
  supervisorId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'user_role'
  },
  name:{
    type    :String,
    required:true,
  },
  generalAvailability:{
    type    :BigInt,
    required:true
  },
  currentAvailability:{
    type    :BigInt,
    required:true
  },
  blockDetails:{
    type    :String,
    required:true,
  },
  description:{
    type    :String,
    required:true,
  },
} , {collection : 'amenities' , index : {'supervisorId' : 1}});
const amenitiesModel = new mongoose.model('amenities' , amenitiesSchema , 'amenities');
//VENUES TO AMENITIES (IN BUILT AMENITIES OR RESTRICTED AMENITIES)
const venueToAmenitiesSchema = new mongoose.Schema({
  venueId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'venue'
  },
  amenityId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'amenity'
  },
  restrictedOrInbuilt:{
    //true for inbuilt and false for restricted
    type    :Boolean,
    required:true
  },
  condition:{
    //working (true) or not(false)
    type    :Boolean,
    required:true
  }
} , {collection : 'vanueToAmenities'});
venueToAmenitiesSchema.index({venueId : 1 , amenityId : 1} , {unique : true});
//BOOKING (STAFF TO VENUE)
const bookingSchema = new mongoose.Schema({
  facultyId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'user_role'
  },
  venueId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'venue'
  },
  statusOfBooking:{
    type    :String,
    required:true,
    //contains three states booked , pending or canceled
  },
  bookingType:{
    type    :Boolean,
    required:true
    //conflict(true) or not (false)
  },
  dateOfBooking:{
    type    :Date,
    required:true,
    validate:{
      validator:validators.testValidator,
      message  :"The choosen Date is Invalid"
    }
  },
  time:{
    type    :[BigInt],//includes start time end time 
    required:true,
    validate:{
      validator:validators.testValidator,
      message  :"The timing choosen already exist rise conflict booking to get priority verification"
    }
  },
  bookingDescription:{
    type    :String,
    required:true
  }
} , {collection : 'booking' , timestamps : true});
bookingSchema.index({venueId:1 , time : 1} , {unique : true});
const bookingModel = new mongoose.model("booking" , bookingSchema , "booking");
//BOOKED_AMENITIES (BOOKING AND ITS RELATED AMENITIES)
const bookedAmenitiesSchema = new mongoose.Schema({
  bookingId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'booking'
  },
  amenityId:{
    type    :mongoose.Schema.Types.ObjectId,
    required:true,
    ref     :'amenity'
  },
  requestedQuantity:{
    type    :BigInt,
    required:true
  }
} , {collection : 'bookedAmenities'});
bookedAmenitiesSchema.index({bookingId:1 , amenityId:1} , {unique:true});
const bookedAmenitiesModel = new mongoose.model('bookedAmenities' , bookedAmenitiesSchema , "bookedAmenities");



