const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
    },
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (error, hash) => {
        if (error) callback(error);

        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        callback(null, fileName);
      });
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    // const allowedMimes = [
    //   'text/csv',
    //   'image/jpeg',
    //   'image/pjpeg',
    //   'image/png',
    //   'image/gif',
    // ];

    callback(null, true);
  },
};
