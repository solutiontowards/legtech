import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/aws.js";

const bucket = process.env.S3_BUCKET;

export const uploadSingle = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: 'private',
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => cb(null, `images/${Date.now()}_${file.originalname}`)
  }),
  limits: { fileSize: 20 * 1024 * 1024 }
});