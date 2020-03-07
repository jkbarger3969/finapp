const parent = ObjectId("5dc46d0af74afb2c2805bd54");
const allowChildren = false;
const active = false;
const createdOn = new Date();
const createdBy = {
    "node" : ObjectId("5dca0427bccd5c6f26b0cde2"),
    "id" : ObjectId("5dc47637cf96e166daa9fd06")
}

db.journalEntries.find({
    "paymentMethod.value.id":ObjectId("5dc46d0af74afb2c2805bd54"),
    "P.O. Number":/^ck-?[0-9]+$/i
}).forEach((it)=> {
    const {_id} = it;
    const [,refId] = it.P.O[" Number"].match(/([0-9]+)/);
    const {insertedId} = db.paymentMethods.insertOne({
        parent,
        active,
        refId,
        name:`CK-${refId}`,
        allowChildren
    });
    
    db.journalEntries.updateOne({_id},{$push:{paymentMethod:{
        $each:[{
            value:{
                node:ObjectId("5dca0427bccd5c6f26b0cddf"),
                id:insertedId
            },
            createdBy,
			createdOn 
        }],
        $position: 0
    }}});
     
});