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

    let beginTrim = document.getElementById("begin-trim");
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
}

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
        if (file == undefined)
        {
            alert("Select a video from your system to begin editing!");
            return;
        }
        else if (isNaN(parseInt(st)) || isNaN(parseInt(et)))
        {
            alert("Please enter valid numbers to trim!");
            return;
        }
        else if (parseInt(st) >= parseInt(et))
        {
            alert("Please ensure that the start breakpoint is earlier than the end breakpoint!");
            return;
        }

        let data = await fetchFile(file);
        let progressElement = document.getElementById("status"), resultElement = document.getElementById("result"), filetypeOptions = document.getElementById("filetype-select"), inputFileType = file.name.split(".").pop(), progressRatio = 0;
        let selectedFiletype = filetypeOptions.value, loadingLabel = document.querySelector(".progress-bar-label"), loadingBar = document.getElementById("bar");
        try
        {
            await ffmpeg.FS("writeFile", "input." + inputFileType, data);
            progressElement.innerHTML = "Converting...";
            loadingBar.style.visibility = "visible";
            loadingLabel.style.visibility = "visible";
            await ffmpeg.setProgress(({ratio}) => {
                console.log(ratio);
                progressRatio = ratio * 100;
                console.log(progressRatio);
                loadingBar.style.width = progressRatio + "%";
            });
            await ffmpeg.run("-i", "input." + inputFileType, "-ss", st, "-to", et, "-async", "1", "output." + selectedFiletype);
    
            progressElement.innerHTML = "Done converting!";
            let content = await ffmpeg.FS("readFile", "output." + selectedFiletype); //Returns a Uint8Array
            resultElement.src = URL.createObjectURL(new Blob([content], {type: "video/mp4"}));
            resultElement.style.visibility = "visible";
        }
        catch(err)
        {
            progressElement.innerHTML = "Error converting!";
            console.log(err);
        }
    })();
}

window.displayVideo = displayVideo;