import multer from 'multer';
import path from 'path';

// Max size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024; // bytes

// RX storage
const storageRx = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/rxrcrd'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-rx${ext}`;
    cb(null, uniqueName);
  }
});

export const uploadrxmulter = multer({ 
  storage: storageRx,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  }
});

// POB storage
const storagePob = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/pobrcrd'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-pob${ext}`;
    cb(null, uniqueName);
  }
});

export const uploadpobmulter = multer({ 
  storage: storagePob,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  }
});
