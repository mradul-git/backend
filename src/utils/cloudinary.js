import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

 

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
    });
    

    const uploadOnCloudinary = async (localFilePath) =>{

     try{
        if(!localFilePath)return null
     const response =  await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
        
    
    //file uploaded successfully
    //console.log("file is uploaded",
    //response.url);

    fs.unlinkSync(localFilePath)
    return response;
     }
    catch(error){
        console.error("cloudianry upload failed",error)
        //fs.unlinkSync(localFilePath) 
       if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
            
    }
}


export {uploadOnCloudinary}
