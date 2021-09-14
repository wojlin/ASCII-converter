var rgb_image_src = null;

function previewFile()
{
  var preview = document.querySelector('img');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();
  var convert_button = document.getElementById("convert_button");

  reader.onloadend = function ()
  {
    preview.src = reader.result;
    rgb_image_src = reader.result;
  }

  if (file) {
    reader.readAsDataURL(file);
    convert_button.style.display = "block";
  } else {
    preview.src = "";
    convert_button.style.display = "none";
  }
}

function convert_core()
{
  var settings = catch_settings();
  console.log(settings);
  convertImage(settings);
}

function catch_settings()
{
  var columns = parseInt(document.getElementById("columns_amount").value);
  var shading = parseInt(document.getElementById("shading_amount").value);
  var contrast = parseInt(document.getElementById("contrast_amount").value);
  var use_colors = document.getElementById("use_colors").checked;
  var invert_colors = document.getElementById("invert_colors").checked;
  return [columns, shading, contrast, use_colors, invert_colors]
}


function greyscaleImage(imgData)
{
  for (i = 0; i < imgData.data.length; i += 4) {
    let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
    let colour = 0;
    if (count > 510) colour = 255;
    else if (count > 255) colour = 127.5;

    imgData.data[i] = colour;
    imgData.data[i + 1] = colour;
    imgData.data[i + 2] = colour;
    imgData.data[i + 3] = 255;
  }
  return imgData
}

function contrastImage(imgData, contrast){  //input range [-100..100]
    var d = imgData.data;
    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 256 * (1 - contrast);
    for(var i=0;i<d.length;i+=4){   //r,g,b,a
        d[i] = d[i]*contrast + intercept;
        d[i+1] = d[i+1]*contrast + intercept;
        d[i+2] = d[i+2]*contrast + intercept;
    }
    return imgData;
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function convertImage(settings)
{
  var rgb_image = new Image();
  rgb_image.src = rgb_image_src;
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var width = rgb_image.width;
  var height = rgb_image.height;
  console.log(width+"x"+height);
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  var divide = parseInt(width/settings[0]);
  var converted_width = settings[0]
  var converted_height = parseInt(height/divide);
  context.drawImage(rgb_image, 0, 0, converted_width, converted_height);
  var imgData = context.getImageData(0, 0, converted_width, converted_height);

  if(settings[3] == false)
  {
    context.putImageData(greyscaleImage(imgData), 0, 0);
  }

  context.putImageData(contrastImage(imgData, settings[2]), 0, 0);

  document.getElementById("main_box").append(canvas);

  chars = ["B","S","#","&","@","$","%","*","!",":","."," "]

  var ascii_image = "";

  for (var y = 0; y < converted_height; y++)
  {
    for (var x = 0; x < converted_width; x++)
    {
      var pixel = getPixel(context, x, y);
      if(pixel[3] == 0)
      {
        convertedChar = pixel[-1];
      }
      else
      {
        var bw_value = parseInt((pixel[0] + pixel[1] + pixel[2])/3);
        var pixel_table_length = chars.length - 1;
        var remapped = parseInt(bw_value.map(0, 255, 0, pixel_table_length));
        if(settings[3] == false)
        {
          var convertedChar = chars[remapped];
        }else
        {
          var convertedChar = toString("<span color='rgb("+toString(pixel[0])+","+toString(pixel[1])+","+toString(pixel[2])+")'>"+toString(chars[remapped])+"</span>");
          console.log(convertedChar);
        }
      }
      ascii_image += convertedChar;
    }
    ascii_image += '\n';
  }
  console.log("show");
  document.getElementById("output_box").style.display = "block";
  document.getElementById("output_textarea").rows = converted_height;
  document.getElementById("output_textarea").cols = converted_width;
  document.getElementById("output_textarea").value = ascii_image;
}

function getPixel(context, x, y)
{
  return context.getImageData(x, y, 1, 1).data;
}
