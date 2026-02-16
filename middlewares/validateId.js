import mongoose from 'mongoose';

export const validateMongoId = (req, res, next) => {

  const { id } = req.params;

    if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID parameter is required",
    });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `The provided ID '${id}' is not a valid MongoDB ObjectId`,
    });
  }
  
  next();
};