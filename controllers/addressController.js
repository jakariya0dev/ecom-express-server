import Address from "../models/addressModel.js";

// Add new address
export const addNewAddress = async (req, res) => {
  try {
    const {
      addressType,
      receiverName,
      receiverPhone,
      line1,
      line2,
      city,
      state,
      country,
    } = req.body;

    const address = new Address({
      user: req.user._id,
      addressType,
      receiverName,
      receiverPhone,
      line1,
      line2,
      city,
      state,
      country,
    });

    await address.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      addressType,
      receiverName,
      receiverPhone,
      line1,
      line2,
      city,
      state,
      country,
    } = req.body;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
        data: null,
      });
    }

    if (addressType) address.addressType = addressType;
    if (receiverName) address.receiverName = receiverName;
    if (receiverPhone) address.receiverPhone = receiverPhone;
    if (line1) address.line1 = line1;
    if (line2) address.line2 = line2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
        data: null,
      });
    }

    await address.remove();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get address details
export const getAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get all addresses
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
