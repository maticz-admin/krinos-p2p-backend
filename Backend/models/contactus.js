// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const contactSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
		required: true,
	},
	usrMsg: {
		type: String,
		default: ''
	},
	adminMsg: {
		type: String,
		default: ''
	},
	softDelete: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

const ContactUs = mongoose.model('contactus', contactSchema, 'contactus');
export default ContactUs;