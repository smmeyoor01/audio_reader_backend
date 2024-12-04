const express = require("express");
const router = express.Router();
const supabase = require('../supabase');
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage()});

//uploads file into temporary buffer(line 5), then uploads to supabase
router.post("/file/upload",upload.single('file'), async(req,res) =>{
    const file = req.file;
    const { data, error } = await supabase.storage.from('subscriptions').upload(file.originalname, file);
    res.json(error);
});

module.exports = router;