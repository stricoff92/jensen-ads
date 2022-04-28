
const log = (text, obj) => {
    if(text) {
        console.log("😺: " + text)
    }
    if(obj) {
        console.log({"😺": obj});
    }
}
log("hi");

let scanning = false;
const main = () => {
    log("main()");
    setInterval(scanForAds, 1500);
};
window.addEventListener("load", main, false);


const scanForAds = () => {
    log("scanForAds()");
    /* Array<Element>
        returns array of iframes
    */
    let frames = document.querySelectorAll("iframe");
    log("found " + frames.length + " iframes");

    // Find frames that have an IAB ad size
    const sizedFrames = [];
    const sizes = [
        [300, 250],
        [728, 90],
        [160, 600],
        [970, 250],
        [320, 50],
        [300, 600],
     ];
    for(let i=0; i<frames.length; i++){
        let frame = frames[i];
        if(sizes.filter(s => s[0]==frame.width && s[1]==frame.height).length > 0){
            sizedFrames.push(frame);
        }
    }
    log("sized frames", sizedFrames);

    // Find frames that have a google_ads ID
    let googleFrames = [];
    for(let i=0; i<sizedFrames.length; i++) {
        if(sizedFrames[i].id.indexOf("google_ads") == 0) {
            googleFrames.push(sizedFrames[i]);
        }
    }
    log("google ad frames", googleFrames);

    for(let i=0; i<googleFrames.length; i++) {
        let frame = googleFrames[i];
        let fileName = getFileName([frame.width, frame.height]);
        if(!fileName) {
            log("could not find replacement for size " + frame.width + "x" + frame.height)
            continue;
        }
        const isrc = chrome.runtime.getURL("/src/img/" + fileName);
        log("replacing frame " + frame.id + " with image " + fileName);
        const img = document.createElement("img");
        img.src = isrc;
        img.style.objectFit = "contain";
        img.width = frame.width;
        img.height = frame.height;
        frame.replaceWith(img);
    }
};

function getFileName(size) {
    let files = [];
    if(size[0] == 300 && size[1] == 250) {
        files.push(
            "j3_300x250.jpg",
            "j5_300x250.jpg",
            "j6_300x250.jpg",
            "j14_300x250.png",
        );
    }
    else if (size[0] == 160 && size[1] == 600) {
        files.push(
            "j12_160x600.jpg",
            "j13_160x600.png",
        );
    }
    else if (size[0] == 728 && size[1] == 90) {
        files.push(
            "j9_728x90.png",
            "j10_728x90.jpg",
        )
    }
    else if (size[0] == 970 && size[1] == 250) {
        files.push(
            "j11_970x250.jpg",
        );
    } else if (size[0] == 300 && size[1] == 600) {
        files.push(
            "j1_300x600.png",
            "j2_300x600.png",
            "j4_300x600.jpg",
            "j7_300x600.png",
            "j8_300x600.png",
        )
    }
    if(!files.length) {
        return null;
    }
    return files[
        Math.floor(Math.random() * files.length)
    ];
}

