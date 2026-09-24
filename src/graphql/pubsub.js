import { PubSub, withFilter } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const TASK_CREATED = "TASK_CREATED";

export { withFilter };
