const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let emailtemplate = new Schema({
	identifier: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	langCode: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['active', 'Inactive'],
		default: "active",  //active, Inactive
	}
}, {
	timestamps: true
});

// const EmailTemplate = mongoose.model("emailtemplate", emailtemplate, 'emailtemplate');
module.exports = mongoose.model('emailtemplate',emailtemplate,'emailtemplate');

// export default EmailTemplate;