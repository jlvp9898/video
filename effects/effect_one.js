const fs = require('fs');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require ('fluent-ffmpeg');
const { Canvas, loadImage, registerFont, Image } = require ('canvas');
const  stitchFramesToVideo  = require('../utils/stitchFramesToVideo.js');
const { renderMainComposition } = require('../compositions/renderMainComposition.js');
var  getVideoFrameReader  = require('../utils/getVideoFrameReader.js');
const pool = require('../bd/mysql_connect.js');

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);


//console.log('Extracting frames from video 1...');
/*
const getVideo1Frame = await getVideoFrameReader(
  '',
  'tmp/video-1',
  frameRate,
);
*/


//Espacio entre contenedores
var space_top = 40 + 10;

var limit_text_const = 30;

var top_text_const = 35;

var type_text = 'bold 40px Arial';

var media = [];




// Load fonts so we can use them for drawing
registerFont('assets/arial-bold.ttf', { family: 'Arial' });
//registerFont('assets/chivo-regular.ttf', { family: 'Chivo' });

const canvas = new Canvas(1280, 720);
const context = canvas.getContext('2d');

// Render each frame

var temp_scena = [];
var temp_left_text = [];
var temp_left_scene = [];
var temp_escena_repeat = [];
var random_posicion = [];
var temp_top_scene = [];
var temp_left_react = [];

module.exports = async function generate_video_effect_one(token){
   media[token] = [];

    temp_scena[token] = 0;
    temp_left_text[token] = [];
    temp_left_scene[token] = [];
    temp_escena_repeat[token] = 1;
    random_posicion[token] = Math.floor(Math.random() * (4-1+1)) + 1;
    temp_top_scene[token] = [];
    temp_left_react[token] = [];

    var data = [];

    const sql = `SELECT * FROM generate_video WHERE token = '${token}'`;
    var result = await pool.query(sql);
    
    if(result.length > 0){
        result = result[0];
        
        data = JSON.parse(result.json_data);

    }

    const sql_status_processing = `UPDATE generate_video SET status="processing" WHERE  token = '${token}'`;
    await pool.query(sql_status_processing);

    // The video length and frame rate, as well as the number of frames required
    // to create the video
    const duration = data.length > 0 ? data[data.length - 1].scene.time: "0";
    const frameRate = 30;
    const frameCount = Math.floor(duration * frameRate);
    

    // Clean up the temporary directories first
    
for (const path of ['tmp/'+token]) {
    if (fs.existsSync(path)) {
      await fs.promises.rm(path, { recursive: true });
    }
    await fs.promises.mkdir(path, { recursive: true });
  }
  
  

  for (let e = 0; e < data.length; e++) {


    if(data[e].scene.cover.includes("videos")){

      var folder_temp = data[e].scene.cover.split("/")[data[e].scene.cover.split("/").length - 1].replace("jpg", "mp4");

      for (const path of ['tmp/'+folder_temp]) {
        if (fs.existsSync(path)) {
          await fs.promises.rm(path, { recursive: true });
        }
        await fs.promises.mkdir(path, { recursive: true });
      }
        
    var getVideoData = await getVideoFrameReader(
        'https://videos.codesolution.es'+data[e].scene.cover.replace("jpg", "mp4"),
        "tmp/"+data[e].scene.cover.split("/")[data[e].scene.cover.split("/").length - 1].replace("jpg", "mp4"),
        frameRate,
      );
      media[token].push(getVideoData);

    }else{
      media[token].push( await loadImage("https://videos.codesolution.es"+data[e].scene.cover));
    }
   
  }

for (let i = 0; i < frameCount; i++) {

  const time = i / frameRate;

   var progress = `Procesando ${Math.round(time * 10) / 10}s de ${duration}s...`;
    const sql_progress = `UPDATE generate_video SET progress="${progress}" WHERE  token = '${token}'`;
    await pool.query(sql_progress);

   
  // Grab a frame from our input videos
  //const image1 = await getVideo1Frame();
 
  context.fillStyle = "#ffffff";
 
    context.fillRect(0, 0, canvas.width, canvas.height);

   
    for (let e = 0; e < data.length; e++) {

    if(data[e].scene.time >= time){


      if(data[e].scene.text.type == "text"){
        space_top = 40 + 10;

        limit_text_const = 30;

        top_text_const = 35;
  
       type_text = 'bold 40px Arial';
  
      }

      if(data[e].scene.text.type == "title"){
        space_top = 80 + 10;

        limit_text_const = 10;

        top_text_const = 70;
  
       type_text = 'bold 80px Arial';
  
      }

      if(data[e].scene.cover.includes("videos")){
        var image1 = await media[token][e]();
        renderFrame(image1,context, duration, time, canvas.width, canvas.height, data[e].scene.id, token);
      }else{
        renderFrame(media[token][e],context, duration, time, canvas.width, canvas.height, data[e].scene.id, token);
      }
       
        generateText(data[e].scene.text, context, i, data[e].scene.id, token);
            
         break
    }

   }
     


  // Store the image in the directory where it can be found by FFmpeg
  const output = canvas.toBuffer('image/jpeg');
  const paddedNumber = String(i).padStart(4, '0');
  await fs.promises.writeFile(`tmp/${token}/frame-${paddedNumber}.jpg`, output);
}



console.log(`Stitching ${frameCount} frames to video...`);

await stitchFramesToVideo(
  'tmp/'+token+'/frame-%04d.jpg',
  'assets/pista.mp3',
  'out/vid/'+token+'.mp4',
  duration,
  frameRate,
);

const sql_status = `UPDATE generate_video SET status="publish" WHERE  token = '${token}'`;
await pool.query(sql_status);

}

function renderFrame(image,context, duration, time,w,h, id, token) {

  w = w + 100;
  h = h + 100;

  if(temp_left_scene[token][id] == undefined){
        for (let step = 0; step < 500; step++) {

            if(temp_escena_repeat[token] == random_posicion[token]){
              random_posicion[token] = Math.floor(Math.random() * (4-1+1)) + 1;
            }

            if(temp_escena_repeat[token] != random_posicion[token]){
              temp_escena_repeat[token] = random_posicion[token];
              break;
            }

          }
  }

  if(random_posicion[token] == 1){

      
      temp_top_scene[token][id] = 0;
      
      if(temp_left_scene[token][id] == undefined){
        temp_left_scene[token][id] = -100;
      }
      
      if(temp_left_scene[token][id] < 0){

        temp_left_scene[token][id] += 0.25;
        
      }

      if( temp_left_scene[token][id] >= 0){
        temp_left_scene[token][id] = 0;
      }
        
  }

if(random_posicion[token] == 2){

    temp_top_scene[token][id] = 0;

    if(temp_left_scene[token][id] == undefined){
      temp_left_scene[token][id] = 0;
    }
    
      temp_left_scene[token][id] -= 0.25;
     
    if( temp_left_scene[token][id] <= -100){
      temp_left_scene[token][id] = 0;
    }
      
}

if(random_posicion[token] == 3){

  temp_left_scene[token][id] = 0;
  
  if(temp_top_scene[token][id] == undefined){
    temp_top_scene[token][id] = -100;
  }
  
  temp_top_scene[token][id] += 0.25;
   
  if( temp_top_scene[token][id] >= 0){
    temp_top_scene[token][id] = 0;
  }
    
}


if(random_posicion[token] == 4){

  temp_left_scene[token][id] = 0;
  
  if(temp_top_scene[token][id] == undefined){
    temp_top_scene[token][id] = 0;
  }
  
  temp_top_scene[token][id] -= 0.25;
   
  if( temp_top_scene[token][id] <= -100){
    temp_top_scene[token][id] = 0;
  }
    
}


  // Calculate the progress of the animation from 0 to 1
  let t = time / duration;

  // Draw the image from left to right over a distance of 550 pixels
  context.drawImage(image, temp_left_scene[token][id], temp_top_scene[token][id], w, h);
}

 function generateText(text, context_parent, time, escena, token) {

  if(temp_scena[token] != escena){
    temp_left_text[token] = [];
    temp_scena[token] = escena;
  }

  var textConfig = text;

  var text = text.text;

  var text_array = text.split(' ');

  //Sumanos la cantidad de caracteres de cada palabra
  var sum_text = 0; 

  //Multiplicamos por cuantos caracteres debe haber para saltar de linea
  var multi_text = 1;

  //Limite de carecteres por linea
  var limit_text = limit_text_const;

  //La suma de caracteres anterior para usar en substring
  var sum_temp = 0;

  //Posicion "Y" del text
  var top_text = top_text_const;
  
  //Posicion "Y" del contenedor
  var top_hight = 0;
  
  //Cantidad de todos los caracteres de la escena
  var count_text = text.length + 1;
  

  //Posicion "X"
  var left = 0;

  var before_temp_array = -1;
  
  for (let x = 0; x < text_array.length; x++) {

    var for_Text =  " "+text_array[x];
     
    sum_text += for_Text.length;
    
    var limit_text_if = limit_text * multi_text;

    if(sum_text >= limit_text_if || count_text == sum_text){
      multi_text++;

      
      context_parent.font = type_text;
      
      var textMeasurement = context_parent.measureText(text.substring(sum_temp,sum_text).replace('<b>', '').replace('</b>', ''));
     
      //Efecto de texto, transforma la variable "temp_left_text[token]"
      effectText(x,  textMeasurement, before_temp_array, token);
      
      var Y_content = (top_hight + 360) - (heightContentText(textConfig) / 2);
      //var Y_text = (top_text + 360) - (heightContentText(textConfig) / 2);

      if(textConfig.align == "center"){
          left = 640 - (textMeasurement.width / 2);
      }

      if(textConfig.align == "right"){
        left = 1230 - textMeasurement.width;
    }

      if(textConfig.align == "left"){
        left = 50;
      }


      var canvas = new Canvas(textMeasurement.width, space_top);
      var context = canvas.getContext('2d');

      context.font = type_text;
      context.fillStyle = "rgba(0,0,0,0.8)";
      context.fillRect(temp_left_react[token][x], 0, textMeasurement.width, space_top);
       
     
      if(text.includes("<b>")){

        var highlight_start = text.indexOf("<b>");
         var highlight_end = text.indexOf("</b>");
         var left_high = 0;
         var sum_text_high = sum_text;
         var sum_text_not_high = sum_text;
         var sum_temp_not_high = sum_temp;

         if(sum_temp != highlight_start){

            if(sum_text > highlight_start){
              sum_text_not_high = highlight_start;
            }

                if(sum_temp < highlight_start){
                //Texto base antes de highlight
                context.textAlign = 'left';
                context.fillStyle = '#ffffff';
                context.strokeStyle = '#ffffff';
                context.fillText(text.substring(sum_temp_not_high,sum_text_not_high ).replace('<b>', '').replace('</b>', ''),  temp_left_text[token][x], top_text);
              }
          }

        if(sum_text > highlight_start){

          if(sum_temp > highlight_start){
            highlight_start =sum_temp;
          }

          if(sum_text > highlight_end){
            sum_text_high = highlight_end;
          }

          if(sum_temp != highlight_start){
            left_high = context.measureText(text.substring(sum_temp,highlight_start).replace('<b>', '').replace('</b>', '')).width;
          }
          

          if(sum_temp < highlight_end){
            context.textAlign = 'left';
            context.fillStyle = '#f66b6d';
            context.strokeStyle = '#f66b6d';
            context.fillText(text.substring(highlight_start,sum_text_high).replace('<b>', '').replace('</b>', ''), left_high + temp_left_text[token][x], top_text);
          }
         
        }

        sum_temp_not_high = sum_temp;
        sum_text_not_high = sum_text;
        left_high = 0;
        if(sum_text > highlight_end){

          if(sum_temp < highlight_end){
            sum_temp_not_high = highlight_end;

            if(sum_temp != highlight_end){
              left_high = context.measureText(text.substring(sum_temp,highlight_end).replace('<b>', '').replace('</b>', '')).width;
            }

          }

              //Texto base despues de highlight
              context.textAlign = 'left';
              context.fillStyle = '#ffffff';
              context.strokeStyle = '#ffffff';
              context.fillText(text.substring(sum_temp_not_high,sum_text_not_high ).replace('<b>', '').replace('</b>', ''),  left_high + temp_left_text[token][x], top_text);
            
        }


      }else{

     
      //Texto
      context.textAlign = 'left';
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#fffffff';
      context.fillText(text.substring(sum_temp,sum_text),  temp_left_text[token][x], top_text);

      }

        
     //Anidar canvas con el canvas padre 
      const datarul = canvas.toDataURL();
      const img = new Image();
      img.src =datarul;
      
      context_parent.drawImage(img, left, Y_content, textMeasurement.width, space_top);

      //Todo esto se suma para el siguiente ciclo del for
      sum_temp = sum_text;
      //top_text += space_top; 
      top_hight += space_top;
      before_temp_array = x;
    }

    
    
  }
    
 

}

function effectText(x,  textMeasurement, before_temp_array, token){

  if(temp_left_react[token][x] == undefined){
    temp_left_react[token][x] = textMeasurement.width;
  }

 
  
  if(temp_left_react[token][x] > 200){

    temp_left_react[token][x] -= 90;
   
  }

  if(temp_left_react[token][x] <= 200 && temp_left_react[token][x] > 0){
  
    temp_left_react[token][x] -= 25;
    
  }

  if(temp_left_react[token][before_temp_array] !=undefined && temp_left_react[token][before_temp_array] > 0){
   temp_left_react[token][x] = textMeasurement.width;
    
  }

  if( temp_left_react[token][x] <= 0){
    temp_left_react[token][x] = 0;
  }
  

  

  if(temp_left_react[token][x] == 0){

    if(temp_left_text[token][x] == undefined){
      temp_left_text[token][x] = textMeasurement.width;
    }
    
    if(temp_left_text[token][x] >= 200){
  
      temp_left_text[token][x] -= 90;
      
    }
    
    if(temp_left_text[token][x] <= 200 && temp_left_text[token][x] > 0){
  
      temp_left_text[token][x] -= 25;
      
    }
  
    if(temp_left_text[token][before_temp_array] !=undefined && temp_left_text[token][before_temp_array] > 0){
      temp_left_text[token][x] = textMeasurement.width;
      
    }
  
    if( temp_left_text[token][x] <= 0){
      temp_left_text[token][x] = 0;
    }

  }



}

function heightContentText(text){

  var text = text.text;

  var text_array = text.split(' ');

  //Sumanos la cantidad de caracteres de cada palabra
  var sum_text = 0; 

  //Multiplicamos por cuantos caracteres debe haber para saltar de linea
  var multi_text = 1;

  //Limite de carecteres por linea
  var limit_text = limit_text_const;

  //La suma de caracteres anterior para usar en substring
  var sum_temp = 0;

  //Posicion "Y" del text
  var top_text = 235;
  
  //Posicion "Y" del contenedor
  var top_hight = 205;
  
  //Cantidad de todos los caracteres de la escena
  var count_text = text.length + 1;
  

  var count_space = 0;

  for (let x = 0; x < text_array.length; x++) {

    var for_Text =  " "+text_array[x];
     
    sum_text += for_Text.length;
    
    var limit_text_if = limit_text * multi_text;

    if(sum_text >= limit_text_if || count_text == sum_text){
      multi_text++;

     
      count_space += space_top;

      
      //Todo esto se suma para el siguiente ciclo del for
      sum_temp = sum_text;
      top_text += space_top; 
      top_hight += space_top;
    }
    
  }


 
  return count_space;

}
