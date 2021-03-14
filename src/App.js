import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.detectFaces = this.detectFaces.bind(this);
    this.processFrame = this.processFrame.bind(this);

    // constants for Azure quickstart
    const msRest = require("@azure/ms-rest-js");
    const Face = require("@azure/cognitiveservices-face");

    const key = "7d3f9afc15424d898bc6fec3cf2780e4";
    const endpoint = "https://eyesupherefaceinstance.cognitiveservices.azure.com/";

    // authenticate the client for azure quickstart
    const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
    const client = new Face.FaceClient(credentials, endpoint);

    this.state = {
      image_base_url: "https://csdx.blob.core.windows.net/resources/Face/Images/",
      client: client
    }
  }

  async componentDidMount() {
    this.monitorVideo();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  monitorVideo() {
    // get video
    const constraints = {
      video: true
    }
    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      let videoTrack = stream.getVideoTracks()[0];
      let imageCapture = new ImageCapture(videoTrack);

      // regularly send a frame to Azure Face for processing
      this.timer = setInterval(() => {
        this.processFrame(imageCapture);
      }, 1000);

    })
  }

  processFrame(imageCapture) {

    // sometimes the track becomes muted. If so, stop the track
    // and get it again.
    let track = imageCapture.track;
    if (track.muted) {
      track.stop();
      clearInterval(this.timer);
      this.monitorVideo();
    }
    // check ready state before grabbing frame to
    // avoid errors from too many frames grabbed quickly
    if (track.readyState === 'live' && track.enabled && !track.muted) {

      // grab a still image from video track
      imageCapture.grabFrame()
      .then((imageBitmap) => {

        // convert image frame into blob
        let canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        let context = canvas.getContext('2d');
        context.drawImage(imageBitmap, 0, 0);
        canvas.toBlob((blob) => {

          // detect faces
          this.detectFaces(blob);

        })
      })
      .catch(e => {
          console.log(e);
      });
    }
  }

  async detectFaces(blob) {
    const detectedFaces = await this.state.client.face.detectWithStream(
        blob,
        {
          returnFaceAttributes: ["Emotion", "HeadPose"],
          detectionModel: "detection_01"
        }
      );
    console.log (detectedFaces.length + " face(s) detected");

    detectedFaces.forEach(async function (face) {
      // Get emotion on the face
      let emotions = "";
      let emotion_threshold = 0.0;
      if (face.faceAttributes.emotion.anger > emotion_threshold) { emotions += "anger, "; }
      if (face.faceAttributes.emotion.contempt > emotion_threshold) { emotions += "contempt, "; }
      if (face.faceAttributes.emotion.disgust > emotion_threshold) { emotions +=  "disgust, "; }
      if (face.faceAttributes.emotion.fear > emotion_threshold) { emotions +=  "fear, "; }
      if (face.faceAttributes.emotion.happiness > emotion_threshold) { emotions +=  "happiness, "; }
      if (face.faceAttributes.emotion.neutral > emotion_threshold) { emotions +=  "neutral, "; }
      if (face.faceAttributes.emotion.sadness > emotion_threshold) { emotions +=  "sadness, "; }
      if (face.faceAttributes.emotion.surprise > emotion_threshold) { emotions +=  "surprise, "; }
      if (emotions.length > 0) {
          console.log ("Emotions: " + emotions.slice (0, -2));
      }
      else {
          console.log ("No emotions detected.");
      }

      // get head pose
      console.log("Head pose:");
      console.log("  Pitch: " + face.faceAttributes.headPose.pitch);
      console.log("  Roll: " + face.faceAttributes.headPose.roll);
      console.log("  Yaw: " + face.faceAttributes.headPose.yaw);
    });
  }

  function audioPrompt() {
   
    function playBuzzer() {
        const buzzer = new Audio("https://www.fesliyanstudios.com/play-mp3/4386");
        buzzer.play();
    }
    
    let beginTimer = setTimeout(playBuzzer, 30000);
         
    let cancelTimer = clearTimeout(beginTimer);
    
    if (!detectFace || face.faceAttributes.headPose.pitch > 45 || face.faceAttributes.headPose.roll > 45 || face.faceAttributes.headPose.yaw > 45) {
        beginTimer;
        if (detectFace && face.faceAttributes.headPose.pitch <= 45 && face.faceAttributes.headPose.roll <= 45 && face.faceAttributes.headPose.yaw <= 45) {
        cancelTimer; 
        } 
    }     
}


  render() {
    return (
      <div className="App">
      <div id="wrapper">
      <header>
        <h1>Eyes Up Here Settings</h1>
      </header>

      <article>
         <form id="settings" action="settings.html" method="POST">
             <p>
                 Attention Prompt Customization - How would you like the app to regain your student's attention?
             </p>
             <input type="checkbox" name="customization" value="statement" id="statement" />
             App will say "Eyes up here" <br/>
             <input type="checkbox" name="customization" value="sounds" id="sounds" />
             App will play an alarm sound <br/>
             <input type="checkbox" name="customization" value="screen" id="screen" />
             Screen will flash different colors<br/>


             <p>Attention Prompt will activate when the student looks away for
                 <select id="activatePrompt">
                     <option value="30">30</option>
                     <option value ="60">60</option>
                     <option value="90">90</option>
                     <option value="120">120</option>
                 </select>
                 seconds.
             </p>
             <br/>
             <p>Notify me if the Attention Prompt is activated
                 <select id="numberOfTimes">
                     <option value="1">1</option>
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                     <option value="5">5</option>
                 </select>
             times in a span of
                 <select id="numberOfMinutes">
                     <option value="1">1</option>
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                     <option value="5">5</option>
                 </select>
             minutes.
             </p>
             <br/>
             <p>
                 Notifications can be sent via SMS text message or email.  You can designate up to 5 different contacts to notify.
             </p>
             <div id="notificationMethod">
                 <select>
                     <option value="Text" id="text">Text</option>
                     <option value="Email" id="email">Email</option>
                 </select>
                 <input type="text" name="notification" id="notification" />

                 <input id="addNotificationMethod" type="button" value="+Add" />
                 <br/>
             </div>

             <br/>
             <input type="submit" value="Save Settings" />
         </form>
      </article>

      </div>
      </div>
    );
  }
}

export default App;
