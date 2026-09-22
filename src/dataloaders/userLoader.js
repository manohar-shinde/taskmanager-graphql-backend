import { User } from "../models/User.js";
import DataLoader from "dataloader";

export const createUserLoader = () => {
  return new DataLoader(async (userIds) => {
    const users = await User.find({
      _id: {
        $in: userIds,
      },
    });
    return userIds.map((userId) => {
      return users.find((user) => user.id.toString() === userId.toString());
    });
  });
};
