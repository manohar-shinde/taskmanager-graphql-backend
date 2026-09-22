import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { requireAuth, requireOwnership } from "../utils/auth.js";
import * as taskService from "../services/taskService.js";
import * as userService from "../services/userService.js";

export const resolvers = {
  Query: {
    me: async (_, args, context) => {
      const user = requireAuth(context);
      return await User.findById(user.userId);
    },

    user: async (_, args) => {
      return await User.findById(args.id);
    },

    tasks: async (_, args, context) => {
      const user = requireAuth(context);
      const page = Math.max(args.page, 1);
      const limit = Math.min(args.limit, 50);
      const skip = (page - 1) * limit;
      const filters = {
        userId: user.userId,
      };
      if (args.completed !== undefined) {
        filters.completed = args.completed;
      }

      const [tasks, total] = await Promise.all([
        Task.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),

        Task.countDocuments(filters),
      ]);

      return {
        tasks,
        total,
      };
    },
    task: async (parent, args, context) => {
      const user = requireAuth(context);
      return await Task.findById(args.id);
    },
  },
  Task: {
    user: async (parent, args, context) => {
      return await context.userLoader.load(parent.userId);
    },
  },
  User: {
    tasks: async (parent, args, context) => {
      return await context.taskLoader.load(parent.id);
    },
  },
  Mutation: {
    login: async (_, args) => {
      const user = await User.findOne({
        email: args.email,
      });
      if (!user) {
        throw new Error("Invalid username or password");
      }

      const passwordMatch = await bcrypt.compare(args.password, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid username or password");
      }

      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );
      return {
        token,
        user,
      };
    },

    createUser: async (_, args) => {
      return await userService.createUser({
        email: args.input.email,
        name: args.input.name,
        password: args.input.password,
      });
    },

    changePassword: async (_, args, context) => {
      const currentUser = requireAuth(context);

      const user = await User.findById(currentUser.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(
        args.currentPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new Error("Current password is incorrect");
      }
      user.password = await bcrypt.hash(args.newPassword, 10);

      await user.save();

      return true;
    },

    deleteAccount: async (parent, args, context) => {
      const user = requireAuth(context);
      const deletedUser = await User.findByIdAndDelete(user.userId);
      if (!deletedUser) {
        throw new Error("User not found");
      }
      await Task.deleteMany({
        userId: user.userId,
      });
      return true;
    },

    // Tasks
    createTask: async (_, args, context) => {
      const user = requireAuth(context);
      return await taskService.createTask({
        title: args.input.title,
        userId: user.userId,
      });
    },

    updateTask: async (parent, args, context) => {
      const user = requireAuth(context);
      const task = await taskService.getTaskById(args.id);
      if (!task) {
        throw new Error("Task not found");
      }
      requireOwnership(task.userId, user.userId);
      return await taskService.updateTask(args.id, args.input);
    },

    deleteTask: async (parent, args, context) => {
      const user = requireAuth(context);

      const deletedTask = await taskService.getTaskById(args.id);

      if (!deletedTask) {
        throw new Error("Task not found");
      }
      requireOwnership(deletedTask.userId, user.userId);
      return await taskService.deleteTask(args.id);
    },
  },
};
