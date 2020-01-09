import * as pathN from 'path';
import * as mergeGraphqlSchemas from 'merge-graphql-schemas';

const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeTypes = mergeGraphqlSchemas.mergeTypes;

const typesArray = fileLoader(pathN.resolve(__dirname, '../schema/**/*.gql'));

export default mergeTypes(typesArray, { all: true });