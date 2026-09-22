import DataLoader from "dataloader";
import { Task } from "../models/Task.js";

export const createTaskLoader = () => {
  return new DataLoader(async (userIds) => {
    const tasks = await Task.find({
      userId: {
        $in: userIds,
      },
    });
    return userIds.map((userId) =>
      tasks.filter((task) => task.userId.toString() === userId.toString()),
    );
  });
};
