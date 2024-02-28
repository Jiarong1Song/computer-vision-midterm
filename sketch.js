// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// https://learn.ml5js.org/#/reference/posenet

/* ===
ml5 Example
PoseNet example using p5.js
=== */
// Global Variables
let capture;
let poseNet;
let poses = []; // this array will contain our detected poses (THIS IS THE IMPORTANT STUFF)
const cam_w = 640;
const cam_h = 480;
let eyeDistance;
let song1; 
let song2;
let hasPlayed = false;
let playFlag1 = false;
let playFlag2 = false;

const options = {
  architecture: "MobileNetV1",
  imageScaleFactor: 0.3,
  outputStride: 16, // 8, 16 (larger = faster/less accurate)
  flipHorizontal: true,
  minConfidence: 0.5,
  maxPoseDetections: 2, // 5 is the max
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: "multiple",
  inputResolution: 257, // 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, or 801, smaller = faster/less accurate
  multiplier: 0.5, // 1.01, 1.0, 0.75, or 0.50, smaller = faster/less accurate
  quantBytes: 2,
};

function setup() {
  createCanvas(cam_w, cam_h);
  capture = createCapture(VIDEO);
  capture.size(cam_w, cam_h);
  //capture.hide();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(capture, options, modelReady);

  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected.
  poseNet.on("pose", function (results) {
    poses = results;
  });

  // Hide the capture element, and just show the canvas
  capture.hide();
  song1 = loadSound('scary.mp3');
  song2 = loadSound('wow.mp3');
  
}

// this function gets called once the model loads successfully.
function modelReady() {
  console.log("Model loaded");
}

function draw() {
  capture.loadPixels();
  // mirror the capture being drawn to the canvas
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0);
  pop();

  if (poses.length > 0) {
    let pose = poses[0].pose;
    eyeDistance = dist(pose.nose.x, pose.nose.y, pose.rightEye.x, pose.rightEye.y);

    textSize(30);
    fill(0, 0, 0);
    //text(`Eye Distance: ${eyeDistance}`, 15, 40);

    // Call eyeDetection here
    eyeDetection();

    // Play the song once each time eyeDistance goes over 120
    if (eyeDistance > 120 && !playFlag1) {
      song1.play();
      playFlag1 = true;
      playFlag2 = false; 
    }
    
    if (eyeDistance < 70 && !playFlag2) {
      song2.play();
      playFlag1 = false;
      playFlag2 = true; 
    }

    // Reset the flag when eyeDistance is less than 120
    if (eyeDistance >= 70 && playFlag2) {
      playFlag2 = false;
    }
    if (eyeDistance <= 120 && playFlag1) {
      playFlag1 = false;
    }
  }
  
  
}

function eyeDetection() {
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let noseX = pose.nose.x;
    let noseY = pose.nose.y;
    textAlign(CENTER)

    if (eyeDistance < 70) {
      push();
      mirror();
      textFont('Luminari');
      textSize(80);  
      fill(255, 0, 255); // Different color for this condition
      text('Great!', noseX, noseY - 80);
      pop();
    } else if (eyeDistance < 120) {
      textSize(50);  
      fill(0, 255, 0);
      text('Not Bad', noseX, noseY - 80);
    } else {
      push();
      textFont('Basikerville');
      textSize(100);
      fill(255, 0, 0);
      threshold(); // Apply threshold effect if needed
      text('WARNING', noseX, noseY - 80);
      pop();
    }
  }
}

function threshold() {
  capture.loadPixels();

  // loop through every pixel in the capture feed
  for (let y = 0; y < cam_h; y++) {
    for (let x = 0; x < cam_w; x++) {
      const index = (x + y * cam_w) * 4;

      // store the red, green and blue values of the current pixel
      const r = capture.pixels[index];
      const g = capture.pixels[index + 1];
      const b = capture.pixels[index + 2];
      // const a = capture.pixels[index+3]

      const brightness = (r + g + b) / 3;
      
      // invert the colors
        // capture.pixels[index] = 255-r;
        // capture.pixels[index + 1] = 255-g;
        // capture.pixels[index + 2] = 255-b;

      if (brightness > 127) {
        // manipulate the pixel data of the capture feed
        capture.pixels[index] = 255;
        capture.pixels[index + 1] = 255;
        capture.pixels[index + 2] = 255;
      } else {
        // manipulate the pixel data of the capture feed
        capture.pixels[index] = 0;
        capture.pixels[index + 1] = 0;
        capture.pixels[index + 2] = 0;
      }
    }
  }

  capture.updatePixels();
  
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0);
  pop();
}

function mirror() {
 
  const stepSize = 5;

  for (let y = 0; y < capture.height; y += stepSize) {
    for (let x = 0; x < capture.width; x += stepSize) {
      const index = (x + y * capture.width) * 4;

      const r = capture.pixels[index];
      const g = capture.pixels[index + 1];
      const b = capture.pixels[index + 2];

    
      const brightness = (r + g + b) / 3;
      const circleSize = map(brightness, 0, 255, 2, stepSize*1.25);

      noStroke();
      
      
      
      if(brightness < 128) {
        fill(10, 244, 3);
      } else {
        fill(0, 134, 0);
      }
      
      if(y > height/4) {
        circle(x, y, circleSize)
      } else {
        rect(x, y, circleSize, circleSize);
      }

      
    }
  }
}

function mousePressed() {
    let fs = fullscreen();
    fullscreen(!fs);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

