if(process.env.NODE_ENV === "development") { require('dotenv').config(); }

import {ApolloServer} from 'apollo-server-koa';
import * as Koa from 'koa';

import resolvers from './resolvers';
import {NodeInfo, Context} from "./types";
import secrets from './secrets';
import mongoDb from './mongoDb';
import typeDefs from './schema';
import { ObjectID } from 'mongodb';

(async ()=> {

  try {
    
    const {DB_PASS, DB_USER} = await secrets();
    const {DB_HOST, DB_PORT} = process.env;

    const db = await mongoDb({
      dbHost:DB_HOST,
      dbPort:DB_PORT,
      dbUser:DB_USER,
      dbPass:DB_PASS,
      db:'accounting'
    });
    
    const nodeMap = await 
      db.collection('nodes').aggregate([
        { $addFields: {id:{$toString: "$_id"}}}
      ]).toArray()
      .then((nodes)=>{

        const nodeTypesIdMap = new Map<string,NodeInfo>();
        const nodeTypesTypeMap = new Map<string,NodeInfo>();

        for(const node of nodes) {

         nodeTypesIdMap.set(node.id, node);
         nodeTypesTypeMap.set(node.typename, node);

        }

        return {id:nodeTypesIdMap, typename:nodeTypesTypeMap};

      });

    const context:Context = {
      db,
      nodeMap,
      user:{
        id:new ObjectID("5de16db089c4360df927a3db")
      }
    };

    const gqlServer = new ApolloServer({ typeDefs, resolvers, context});

    const gqlApp = new Koa();
    gqlApp.use(gqlServer.getMiddleware());


    gqlApp.listen({ port: 4000 }, () =>
      console.log(`Graphql server ready at http://localhost:4000${gqlServer.graphqlPath}`),
    );


  } catch(e) {

    console.error(e);
    
  }

})(); 

