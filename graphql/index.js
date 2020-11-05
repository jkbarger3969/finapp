const MongoClient = require("mongodb").MongoClient;

(async () => {
  // For a replica set, include the replica set name and a seedlist of the members in the URI string; e.g.
  // const uri = 'mongodb://mongodb0.example.com:27017,mongodb1.example.com:27017/?replicaSet=myRepl'
  // For a sharded cluster, connect to the mongos instances; e.g.
  // const uri = 'mongodb://mongos0.example.com:27017,mongos1.example.com:27017/'

  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  await client.connect();

  // Prereq: Create collections.

  const result1 = await client
    .db("mydb1")
    .collection("foo")
    .insertOne({ abc: 0 }, { w: "majority" });

  const result2 = await client
    .db("mydb2")
    .collection("bar")
    .insertOne({ xyz: 0 }, { w: "majority" });

  // Step 1: Start a Client Session
  const session = client.startSession();

  // Step 2: Optional. Define options to use for the transaction
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
  // Note: The callback for withTransaction MUST be async and/or return a Promise.
  try {
    await session.withTransaction(async () => {
      const coll1 = client.db("mydb1").collection("foo");
      const coll2 = client.db("mydb2").collection("bar");

      console.log("BEFORE coll1", await coll1.find({}, { session }).toArray());
      console.log("BEFORE coll2", await coll2.find({}, { session }).toArray());

      // Important:: You must pass the session to the operations

      console.log(
        "Update 1 Result",
        await coll1.updateOne(
          { _id: result1.insertedId },
          { $set: { abc: 1 } },
          { session }
        )
      );
      console.log(
        "Update 2 Result",
        await coll2.updateOne(
          { _id: result2.insertedId },
          { $set: { xyz: 999 } },
          { session }
        )
      );

      console.log("AFTER coll1", await coll1.find({}, { session }).toArray());
      console.log("AFTER coll2", await coll2.find({}, { session }).toArray());
    }, transactionOptions);
  } finally {
    await session.endSession();
    await client.close();
  }
})();
