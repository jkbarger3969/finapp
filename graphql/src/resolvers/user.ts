import {UserResolvers} from "../graphTypes";
import {nodeFieldResolver} from "./utils/nodeResolver";

export const User:UserResolvers = {
  user:nodeFieldResolver
};