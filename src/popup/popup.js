
document.addEventListener("DOMContentLoaded", function(event) {
    chrome.storage.local.get(['active'], results => {
        document.getElementById("enabled-checkbox").checked = results.active;
    });

    document.getElementById("enabled-checkbox").addEventListener("click", ()=> {
        const active = document.getElementById("enabled-checkbox").checked;
        setTimeout(()=>{
            chrome.storage.local.set({ active });
        }, 10);
    });
});
