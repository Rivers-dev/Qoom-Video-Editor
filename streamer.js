/*
By Connor T
Edited 2/5/21
Streamer logic for the Qoom video editor
https://github.com/Rivers-dev/Qoom-Video-Editor
*/

const { createFFmpeg, fetchFile } = FFmpeg; //Load ffmpeg/wasm and the fetchfile module (used for telling ffmpeg what to edit)
const ffmpeg = createFFmpeg({ log: true }); //Create ffmpeg object with logging ON
var debug = false; //Debug variable that triggers various logging within the program

(async () => { //Load ffmpeg when the webpage starts and wait for it
    await ffmpeg.load();
})();

var videoPlayer = videojs("video", { //Load VideoJS. It's not in use now, but I plan to use it in the future
    fluid: true
});

//Adding event listeners 
let beginTrim = document.getElementById("begin-trim");
beginTrim.addEventListener("click", function()
{
    if (debug)
    {
        console.log("Trim requested...");
    }
    let startTrimValue = document.getElementById("start-trim-value").value, endTrimValue = document.getElementById("end-trim-value").value;
    validateTrim(startTrimValue, endTrimValue, videoPlayer);
});

document.addEventListener("DOMContentLoaded", function() 
{
    if (debug)
    {
        console.log("DOM Content loaded.");
    }
});

//Load the video that the user uploads
function displayVideo()
{
    let fileInput = document.getElementById("file-input");
    let videoElement = document.getElementById("video_html5_api");
    let file = fileInput.files[0];
    let videoObject = URL.createObjectURL(file);

    videoElement.src = videoObject;
    videoElement.load();
    videoElement.play();
}

//Verify and execute the trim
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
        if (file == undefined) //User doesn't add a video before pressing trim
        {
            alert("Select a video from your system to begin editing!");
            return;
        }
        else if (isNaN(parseInt(st)) || isNaN(parseInt(et))) //Prevents non-integer breakpoints (I think)
        {
            alert("Please enter valid numbers to trim!");
            return;
        }
        else if (parseInt(st) >= parseInt(et)) //Prevents the user from making the end breakpoint earlier than the start breakpoint
        {
            alert("Please ensure that the start breakpoint is earlier than the end breakpoint!");
            return;
        }

        let data = await fetchFile(file);
        let progressElement = document.getElementById("status"), resultElement = document.getElementById("result"), filetypeOptions = document.getElementById("filetype-select"), inputFileType = file.name.split(".").pop(), progressRatio = 0;
        let selectedFiletype = filetypeOptions.value, loadingLabel = document.querySelector(".progress-bar-label"), loadingBar = document.getElementById("bar");
        try
        {
            await ffmpeg.FS("writeFile", "input." + inputFileType, data); //Write a temporary file with the contents of the user-inputted file
            progressElement.innerHTML = "Converting..."; //Update progress label
            loadingBar.style.visibility = "visible"; //Make loading bar visible
            loadingLabel.style.visibility = "visible";

            //Get the progress of the conversion and convert it to a ratio to change the loading bar width
            await ffmpeg.setProgress(({ratio}) => {
                console.log(ratio);
                progressRatio = ratio * 100;
                console.log(progressRatio);
                loadingBar.style.width = progressRatio + "%";
            });

            //Runs the main conversion
            await ffmpeg.run("-i", "input." + inputFileType, "-ss", st, "-to", et, "-async", "1", "output." + selectedFiletype);
    
            progressElement.innerHTML = "Done converting!";
            let content = await ffmpeg.FS("readFile", "output." + selectedFiletype); //Returns a Uint8Array; raw data output
            resultElement.src = URL.createObjectURL(new Blob([content], {type: "video/" + selectedFiletype})); //Makes a new blob with the resulting file as the source of the video element
            resultElement.style.visibility = "visible"; //Makes the lower video element visible
        }
        catch(err)
        {
            progressElement.innerHTML = "Error converting!";
            console.log(err);
        }
    })();
}

window.displayVideo = displayVideo;