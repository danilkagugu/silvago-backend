import HttpError from "../helpers/HttpError.js";
import User from "../models/user.js";
import Client from "../models/userTorgsoft.js";
import { updateSchema } from "../schemas/authSchema.js";

export const getCurrentUser = async (req, res, next) => {
  // console.log("req: ", req.user);
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
    const { firstName, lastName, middleName, phone, email, city } = req.body;
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(middleName && { middleName }),
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
    const updatedUser = await Client.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    console.log("updatedUser", updatedUser);
    const feedbackMessage = {
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.firstName,
      serName: updatedUser.lastName,
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

export const getCurrentUserTorgsoft = async (req, res, next) => {
  // console.log("req: ", req.user);
  try {
    const user = await Client.findById(req.user.id);
    // console.log("user🤳👌🙌🙌🐱‍🐉: ", user);

    const feedbackMessage = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.phone,
      email: user.email,
      // password: user.password,
      city: user.city,
      region: user.region,
      cardNumber: user.cardNumber,
      bonuses: user.bonuses,
    };
    // console.log("feedbackMessage💖💖💖", feedbackMessage);
    res.status(200).json(feedbackMessage).end();
  } catch (error) {
    next(error);
  }
};

export const updateUserTorgsoft = async (req, res, next) => {
  try {
    const { firstName, lastName, middleName, phone, email, city } = req.body;
    const normalizePhoneNumber = (number) => {
      return number.replace(/\D/g, ""); // Видаляє всі зайві символи
    };
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;
    console.log("normalizedPhone: ", normalizedPhone);
    // console.log("middleName: ", middleName);
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(middleName && { middleName }),
      ...(normalizedPhone && { phone: normalizedPhone }),
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
    const updatedUser = await Client.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    const feedbackMessage = {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      middleName: updatedUser.middleName,
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
