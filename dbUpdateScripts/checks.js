const parent = ObjectId("5dc46d0af74afb2c2805bd54");
const allowChildren = false;
const active = false;
const createdOn = new Date();
const createdBy = {
    "node" : ObjectId("5dca0427bccd5c6f26b0cde2"),
    "id" : ObjectId("5dc47637cf96e166daa9fd06")
};

const numRegex = /c(?:h|k)\s*[-:#]?\s*([0-9]+)/i;

let insert = 0;

db.journalEntries.find({
    "paymentMethod.value.id":ObjectId("5dc46d0af74afb2c2805bd54"),
    $or: [{
        "P.O. Number":numRegex
    },{
        "description.0.value":numRegex
    }]
}).forEach((it)=> {
    const {_id} = it;
    
    const strWCKNum = it.description && it.description[0] && numRegex.test(it.description[0].value) ?
        it.description[0].value : it.P.O[" Number"];
    
    const [,refId] = strWCKNum.match(numRegex);
    
    const {insertedId} = db.paymentMethods.insertOne({
        parent,
        active:[{
            value:active,
            createdBy,
            createdOn
        }],
        name:[{
            value:refId,
            createdBy,
            createdOn
        }],
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
    insert++;
});

console.log(`${insert} check numbers inserted.`);