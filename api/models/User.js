import validator from 'validator';
import mongoose from 'mongoose';
import Env from '../config/env.config.js';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        validate: [validator.isEmail, 'is not valid'],
        index: true,
        trim: true
    },
    fullName: {
        type: String,
        required: [true, "can't be blank"],
        index: true,
        trim: true
    },
    phone: {
        type: String,
        validate: {
            validator: (value) => {

                // Check if value is empty then return true.
                if (!value) {
                    return true;
                }

                // If value is empty will not validate for mobile phone.
                return validator.isMobilePhone(value);
            },
            message: '{VALUE} is not valid'
        },
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        minlength: 6
    },
    active: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    language: { // ISO 639-1 (alpha-2 code)
        type: String,
        default: process.env.SC_DEFAULT_LANGUAGE,
        lowercase: true,
        minlength: 2,
        maxlength: 2
    },
    type: {
        type: String,
        enum: [Env.USER_TYPE.USER, Env.USER_TYPE.ADMIN],
        default: Env.USER_TYPE.USER
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'User'
});

const userModel = mongoose.model('User', userSchema);

userModel.on('index', (err) => {
    if (err) {
        console.error('User index error: %s', err);
    } else {
        console.info('User indexing complete');
    }
});

export default userModel;