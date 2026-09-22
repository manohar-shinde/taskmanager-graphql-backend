import DataLoader from "dataloader";
import { Task } from "../models/Task.js";
import { use } from "react";

export const createTaskLoader = () => {
  return new DataLoader(async (userIds) => {
    const tasks = await Task.find({
      userId: {
        $in: userIds,
      },
    });
    const taskMap = new Map();

    for (const task of tasks) {
      const userId = task.userId.toString();
      if (!taskMap.has(userId)) {
        taskMap.set(userId, []);
      }
      taskMap.get(userId).push(task);
    }

    return userIds.map((userId) => taskMap.get(userId.toString()) ?? []);
  });
};
