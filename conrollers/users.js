import HttpError from "../helpers/HttpError.js";
import User from "../models/user.js";
import { updateSchema } from "../schemas/authSchema.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const feedbackMessage = {
      id: user._id,
      name: user.name,
      serName: user.serName,
      phone: user.phone,
      email: user.email,
      password: user.password,
      city: user.city,
    };
    res.status(200).json(feedbackMessage).end();
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, serName, phone, email, city } = req.body;
    const updateData = {
      ...(name && { name }),
      ...(serName && { serName }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(city && { city }),
    };

    const { error } = updateSchema.validate(updateData, {
      abortEarly: false,
    });

    if (error) {
      console.error("Validation error:", error);
      throw HttpError(400, error.details[0].message);
    }
    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    const feedbackMessage = {
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      serName: updatedUser.serName,
      phone: updatedUser.phone,
      city: updatedUser.city,
    };
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    next(error);
  }
};
