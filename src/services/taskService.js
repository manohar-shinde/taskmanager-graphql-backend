import { Task } from "../models/Task.js";

export const createTask = async ({ title, userId }) => {
  return await Task.create({
    title,
    userId,
  });
};

export const getTaskById = async ({ id }) => {
  return await Task.findById(id);
};

export const updateTask = async (id, input) => {
  return await Task.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
};

export const deleteTask = async (id) => {
  return await Task.findByIdAndDelete(id);
};
