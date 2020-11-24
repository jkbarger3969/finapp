import * as pathN from "path";
// import * as mergeGraphqlSchemas from "merge-graphql-schemas";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";

// const fileLoader = mergeGraphqlSchemas.fileLoader;
// const mergeTypes = mergeGraphqlSchemas.mergeTypes;

const typesArray = loadFilesSync(
  pathN.resolve(__dirname, "../schema/**/*.gql")
);

export default mergeTypeDefs(typesArray);
