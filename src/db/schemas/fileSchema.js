import { Schema } from "mongoose";


const fileSchema = new Schema({
    name: String,
    desc: String,
    file:
    {
        data: Buffer,
        contentType: String
    }
});

export default fileSchema;