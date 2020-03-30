const createdOn = new Date();
const createdBy = {
    "node" : ObjectId("5dca0427bccd5c6f26b0cde2"),
    "id" : ObjectId("5dc47637cf96e166daa9fd06")
}
const lastUpdate = createdOn;

const checkId = ObjectId("5dc46d0af74afb2c2805bd54");
const creditId = ObjectId("5dc46d0af74afb2c2805bd55");

const mcRegex = /mc-([0-9]{4})/i;

db.paymentMethods.find({}).forEach(({_id, active, name, method, ...rest}) => { 
    
    // Set Name
    let nameStr;
    if(Array.isArray(name)) {
        nameStr = name[0].value;
    } else if(typeof name === "string") {
        nameStr = name;
    } else if(mcRegex.test(method || "")) {
        const [,mcNum] = method.match(mcRegex);
        nameStr = `MC-${mcNum}`;
    } else {
        nameStr = (method || "").charAt(0).toUpperCase() + method.slice(1);
    }
    
    const $set = {
        allowChildren:checkId.equals(_id) || creditId.equals(_id),
        lastUpdate
    };
    
    
    // Add History
    if(!Array.isArray(active)) {
        $set["active"] = [{
            value:active,
            createdBy,
            createdOn
        }];
    }
    
    if(!Array.isArray(name)) {
        $set["name"] = [{
            value:nameStr,
            createdBy,
            createdOn
        }];
    }
    
    // Set credit as parent
    if(mcRegex.test(nameStr)) {
        $set["parent"] = creditId;
    }
    
    // Add root history
    if(!("lastUpdate" in rest)) {
        $set["lastUpdate"] = lastUpdate;
    }
    
    if(!("createdOn" in rest)) {
        $set["createdOn"] = createdOn;
    }
    
    if(!("createdBy" in rest)) {
        $set["createdBy"] = createdBy;
    }
        
    const result = db.paymentMethods.updateOne({_id},{$set});
    
    console.log(result);
          
});