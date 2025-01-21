import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
    videoFile: {
        type: String, //cloudinary video url
        required: [true, "Video file is required."],
    },
    thumbnail: {
        type: String, //cloudinary image url
        required: [true, "Thumbnail is required."],
    },  
    title: {
        type: String,
        required: [true, "Title is required."],
    },
    description: {
        type: String,
        required: [true, "Description is required."],
    },
    duration: {
        type: String,
        required: [true, "Duration is required."],
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);