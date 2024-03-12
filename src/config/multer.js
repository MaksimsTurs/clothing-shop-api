import multer, { diskStorage } from "multer";

const storage = diskStorage({ filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) })

export default multer({ storage })