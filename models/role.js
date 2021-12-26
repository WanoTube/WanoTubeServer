var mongoose = require("mongoose");
const schemaOptions = {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const roleSchema = new mongoose.Schema({
    role_name: String,
}, schemaOptions);

const Role =  mongoose.model('Role', roleSchema);
module.exports.Role = Role;
