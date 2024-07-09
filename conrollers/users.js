import User from "../models/user.js";

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
      gender: user.gender,
    };
    res.status(200).json(feedbackMessage).end();
  } catch (error) {
    next(error);
  }
};
