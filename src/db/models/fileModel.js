import mongoose from 'mongoose';
import fileSchema from './../schemas/fileSchema';

const File = mongoose.model('File', fileSchema)
export default File