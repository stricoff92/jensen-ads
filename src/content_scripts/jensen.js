
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
    scanForAds()
};
window.addEventListener("load", main, false);

const fileNameToSizeArray = (name) => {
    return name.split(".")[0].split("_")[1].split("x");
}


const getActive = async () => { return new Promise(resolve => {
    chrome.storage.local.get(['active'], results => {
        resolve(results.active);
    });
})};

const scanForAds = async () => {
    const active = await getActive();
    if(!active) {
        return;
    }
    log("scanForAds()");

    /* Array<Element>
        returns array of iframes
    */
    let frames = document.querySelectorAll("iframe");
    log("found " + frames.length + " iframes");

    const files = [];
    const sizes = [];
    const manifest = chrome.runtime.getManifest();
    const war = manifest.web_accessible_resources[0];
    for(let i in war.resources) {
        files.push(war.resources[i]);
        sizes.push(
            fileNameToSizeArray(war.resources[i])
        );
    }

    // Find frames that have an IAB ad size
    const sizedFrames = [];
    for(let i=0; i<frames.length; i++){
        let frame = frames[i];
        if(sizes.filter(
            s => (s[0]==frame.width || cssWidthPx(frame)==s[0]) && (s[1]==frame.height || cssHeightPx(frame)==s[1])
        ).length > 0){
            sizedFrames.push(frame);
        }
    }
    log("sized frames", sizedFrames);

    // Find frames that have a google_ads ID
    let adFrames = [];
    for(let i=0; i<sizedFrames.length; i++) {
        if(isAdIframe(sizedFrames[i])) {
            adFrames.push(sizedFrames[i]);
        }
    }
    log("ad frames", adFrames);

    // Replace iframes with imgs
    for(let i=0; i<adFrames.length; i++) {
        let imgW;
        let imgH;
        let frame = adFrames[i];
        let fileName = getFileName(files, [frame.width, frame.height]);
        if(!fileName) {
            log("could not find replacement for (f)size " + frame.width + "x" + frame.height)
            fileName = getFileName(files, [cssWidthPx(frame), cssHeightPx(frame)]);
            if(!fileName) {
                log("could not find replacement for (c)size " + cssWidthPx(frame) + "x" + cssHeightPx(frame))
                continue;
            } else {
                imgW = cssWidthPx(frame);
                imgH = cssHeightPx(frame);
            }
        } else {
            imgW = frame.width;
            imgH = frame.height;
        }



        const isrc = chrome.runtime.getURL(fileName);
        log("replacing frame " + frame.id + " with image " + fileName);
        log(imgW + "x" + imgH);
        const img = document.createElement("img");
        img.src = isrc;
        img.style.objectFit = "contain";
        img.width = imgW;
        img.height = imgH;
        img.style.width = imgW;
        img.style.height = imgH;
        frame.replaceWith(img);
    }

    setTimeout(scanForAds, 500);
};

function getFileName(files, size) {
    let filesToUse = [];
    for(let i in files) {
        let fSize = fileNameToSizeArray(files[i]);
        if(fSize[0] == size[0] && fSize[1] == size[1]) {
            filesToUse.push(files[i])
        }
    }
    if(!filesToUse.length) {
        return null;
    }
    return filesToUse[
        Math.floor(Math.random() * filesToUse.length)
    ];
}

function isAdIframe(frame) {
    if((frame.id || "").toLowerCase().indexOf("ads") != -1) {
        return true;
    }
    if((frame.id || "").toLowerCase().indexOf("safeframe") != -1) {
        return true;
    }
    if((frame.title || "").toLowerCase().indexOf("advertisement") != -1) {
        return true;
    }
    return false;
}

function cssWidthPx(frame) {
    return frame.style.width.replace(/[^\d]/g, "");
}
function cssHeightPx(frame) {
    return frame.style.height.replace(/[^\d]/g, "");
}
