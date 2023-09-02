import multer, { diskStorage } from "multer";

export const fileValidationObj = {
  image: ["image/png", "image/jpg"],
  file: ["application/json"],
};

export const fileUpload = (formats) => {
  const storage = diskStorage({});
  const fileFilter = (req, file, cb) => {
    if (!formats.includes(file.mimetype))
      return cb(new Error("Invalid format!"), false);

    return cb(null, true);
  };
  const multerUpload = multer({ storage, fileFilter });
  return multerUpload;
};
