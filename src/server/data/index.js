const express = require('express');
const fs = require("fs");

const path = require('path');

const data_path = path.join(__dirname, 'data_file/');

const multer  = require('multer');
const upload = multer({ dest: path.join(__dirname, 'data_tmp/') });


const router = express.Router();


router.get('/:fileName', (req, res) => {
  const file = readDataFile(data_path + req.params.fileName);
  res.send(file);
});
router.post('/:fileName', (req, res) => {
  fs.writeFileSync(data_path + req.params.fileName, req.body);
  res.send('1');
});
const readDataFile = (path) => {
  return fs.readFileSync(path, 'utf8');
}
router.post('/', upload.any(), (req, res) => {
  const file = req.files[0];
  data = readDataFile(file.path);
  const dest_file = data_path + req.body.name;
  fs.writeFileSync(dest_file, data);
  res.send('1');
});
module.exports = router;