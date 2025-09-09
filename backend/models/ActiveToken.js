import mongoose from 'mongoose';

const activeTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    isActiveToken: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 120 } // auto-delete after 2 min
    }
});

const ActiveToken = mongoose.model('ActiveToken', activeTokenSchema);

export default ActiveToken;
