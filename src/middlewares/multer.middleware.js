import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})

const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },  // Expect one avatar file
  { name: 'coverImage', maxCount: 1 }  // Expect one cover image file (optional)
]);

export { uploadFields };