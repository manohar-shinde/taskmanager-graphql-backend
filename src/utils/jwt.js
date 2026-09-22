import jwt from "jsonwebtoken";

export const getUserFromToken = (token) => {
  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    return decodedUser;
  } catch (e) {
    return null;
  }
};
