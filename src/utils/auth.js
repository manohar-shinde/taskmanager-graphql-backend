import { GraphQLError } from "graphql";

export const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  return context.user;
};

export const requireOwnership = (ownerId, userId) => {
  if (ownerId.toString() !== userId) {
    throw new GraphQLError("Not authorized", {
      extensions: {
        code: "FORBIDDEN",
      },
    });
  }
};
