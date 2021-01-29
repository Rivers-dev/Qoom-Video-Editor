/*
Trimming options:
    - Select clip
        > Delete outer edges 

*/

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
var debug = true;

(async () => {
  await ffmpeg.load();
})();

function displayVideo()
{
    let fileInput = document.getElementById("file-input");
    let videoElement = document.getElementById("video_html5_api");
    let file = fileInput.files[0];
    let videoObject = URL.createObjectURL(file);
    var reader = new FileReader();

    videoElement.src = videoObject;
    videoElement.load();
    videoElement.play();

    (async () => 
    {
        let data = await fetchFile(file);
        ffmpeg.run('-i', file, '-s', '1920x1080', 'output.mp4');
        if (debug)
        {
            console.log(data);
        }

    })();
}

function handleTime(v, p, s) //Function takes entered time, videoPlayer object, and a state (whether it's the start trim (true) or end trim (false))
{
    console.log("Handling time...");
    if (!isNaN(v) && (v > 0) && (v < p.duration()))
    {
        //Time entered is a number bigger than zero and lower than the duration of the video (valid)
        p.currentTime(v);
        console.log("User entered trim: ", v);
    }
    else
    {
        //Time entered is either an invalid number or not entered at all, use current time instead
        console.log("Defaulted to current time: ", p.currentTime());
    }
}

document.addEventListener("DOMContentLoaded", function() 
{
    var videoPlayer = videojs("video", {
        fluid: true
    });

    //Video editing menu
    let startTrim = document.getElementById("start-trim-button"), 
    startTrimValue = document.getElementById("start-trim-value"), 
    endTrim = document.getElementById("end-trim-button"), 
    endTrimValue = document.getElementById("end-trim-value");

    startTrim.addEventListener("click", function() {
        handleTime(startTrimValue.value, videoPlayer, true)
    });
    endTrim.addEventListener("click", function() {
        handleTime(endTrimValue.value, videoPlayer, false);
    });
});
