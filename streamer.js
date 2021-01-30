/*
Trimming options:
    - Select clip
        > Delete outer edges 
*/

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
var debug = true;

document.addEventListener("DOMContentLoaded", function() 
{
    if (debug)
    {
        console.log("DOM Content loaded.");
    }

    var videoPlayer = videojs("video", {
        fluid: true
    });

    beginTrim = document.getElementById("begin-trim");
    beginTrim.addEventListener("click", function()
    {
        if (debug)
        {
            console.log("Trim requested...");
        }
        let startTrimValue = document.getElementById("start-trim-value").value,
        endTrimValue = document.getElementById("end-trim-value").value;
        validateTrim(startTrimValue, endTrimValue, videoPlayer);
    });
});

(async () => {
  await ffmpeg.load();
})();

function displayVideo()
{
    let fileInput = document.getElementById("file-input");
    let videoElement = document.getElementById("video_html5_api");
    let file = fileInput.files[0];
    let videoObject = URL.createObjectURL(file);

    videoElement.src = videoObject;
    videoElement.load();
    videoElement.play();

    // (async () => 
    // {
    //     var data = await fetchFile(file);
    //     ffmpeg.FS("writeFile", "example.mp4", data);
    //     ffmpeg.run('-i', "example.mp4", '-s', '1920x1080', 'output.mp4');
    //     if (debug)
    //     {
    //         console.log(data);
    //     }

    // })();
}

var previouslyTrimmed = false, previousInputFiletype, previousRequestedFiletype; //Variable that keeps track if the user has requested a trim in the same session; used to conserve memory

function validateTrim(st, et, p) //Function takes entered time and videoPlayer object
{
    if (debug)
    {
        console.log("Validating requested trim...");
        console.log(st, et);
    }
    (async () =>
    {
        let fileInput = document.getElementById("file-input");
        let file = fileInput.files[0];
        let data = await fetchFile(file);
        let progressElement = document.getElementById("progress"), downloadElement = document.getElementById("file-download-link"), resultElement = document.getElementById("result"), resultElementSource = document.getElementById("result-source");
        await ffmpeg.FS("writeFile", "input.mp4", data);
        progressElement.innerHTML = "Converting...";
        await ffmpeg.run("-i", "input.mp4", "-ss", st, "-to", et, "-async", "1", "output.mp4");

        progressElement.innerHTML = "Done converting!";
        let content = await ffmpeg.FS("readFile", "output.mp4"); //Returns a Uint8Array
        downloadElement.href = URL.createObjectURL(new Blob([content], {type: "video/mp4"})); //Creates blob file with array
        downloadElement.style.visibility = "visible";
        resultElement.src = URL.createObjectURL(new Blob([content], {type: "video/mp4"}));
        resultElement.style.visibility = "visible";
    })();
}
