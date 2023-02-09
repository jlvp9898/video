var express = require("express");
const router = express.Router();
const pool = require('../bd/mysql_connect.js');
var generate_video_effect_one = require('../effects/effect_one.js');


  router.get('/generate_video/:token', async (req, res) => {

    var token = req.params.token;
    const sql = `SELECT * FROM generate_video WHERE token = '${token}'`;
    var result = await pool.query(sql);

    if(result[0].status == "draft"){
       generate_video_effect_one(token);
    }

    res.send("hola");
  });

  

  module.exports = router;