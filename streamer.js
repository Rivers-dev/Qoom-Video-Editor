/*
Trimming options:
    - Select clip
        > Delete outer edges 

*/

const { createFFmpeg } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

(async () => {
  await ffmpeg.load();
})();

function selectedVideo(self)
{
    var file = self.files[0];
    var reader = new FileReader();
    reader.onload = function(r)
    {
        let src = r.target.result;
        let video = document.getElementById("video");
        let source = document.getElementById("source");

        source.setAttribute("src", src);
        video.load();
        video.play();
    };

    reader.readAsDataURL(file);
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