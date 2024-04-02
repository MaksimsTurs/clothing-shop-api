import multer, { diskStorage, memoryStorage } from "multer";

const storage = memoryStorage({ filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) })

export default multer({ storage })