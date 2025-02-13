const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let HelpCentrecategory = new Schema({
	categoryName:{
		type: String, default: ''
    },
    status:{
		type: String, default: 1, // 0 - Inactive, 1-active
	}
});

module.exports = mongoose.model('HelpCentrecategory',HelpCentrecategory,'HelpCentrecategory');
