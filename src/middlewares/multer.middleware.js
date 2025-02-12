import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb is callback
        cb(null, "public/temp/")
    },
    filename: function (req, file, cb) {
        console.log(file)
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + "-" + uniqueSuffix+".png")
        // cb(null, file.originalname) // if you want to keep the original name
    }
});


export const upload = multer({ 
    storage, 
})