import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true, // receiver name
    },
    phone: {
      type: String,
      required: true, // receiver phone number
    },
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
      default: null,
    },
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: "Bangladesh",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
