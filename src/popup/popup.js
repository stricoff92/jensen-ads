
document.addEventListener("DOMContentLoaded", function(event) {
    chrome.storage.local.get(['active'], results => {
        document.getElementById("enabled-checkbox").checked = results.active;
    });

    document.getElementById("enabled-checkbox").addEventListener("click", ()=> {
        setTimeout(()=>{
            const payload = {
                active: document.getElementById("enabled-checkbox").checked
            };
            chrome.storage.local.set(payload);
        }, 10);
    });
});
