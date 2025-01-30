import dotenv from "dotenv";
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

dotenv.config({
  path: './.env'
})


cloudinary.config({
    cloud_name: `${process.env.CLOUDNARY_NAME}`,
    api_key: `${process.env.CLOUDNARY_API_KEY}`,
    api_secret: `${process.env.CLOUDNARY_API_SECRET}`
});

const uploadCloud = async (filePath) => {
    try {
        if (!filePath) {
            console.log('No file path provided');
            return null;
        }
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
        });
        // console.log('File uploaded successfully', response.url);

        fs.unlinkSync(filePath); // delete the file from the server
        return response;

    } catch (error) {
        fs.unlinkSync(filePath); // delete the file from the server
        console.log(error);
        return null;
        
    }
};

export { uploadCloud }
