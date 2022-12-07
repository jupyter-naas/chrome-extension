const storageCache = {};

// get storage data
chrome.storage.local.get(null, (items) => {
    Object.assign(storageCache, items);
});

// keep data updated
chrome.storage.onChanged.addListener((changes, area) => {

    for (const item in changes) {
        // console.log(changes[item]);
        storageCache[item] = changes[item].newValue;
    }
})

// update changes
async function updateStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.set(storageCache, () => {
            resolve(true);
        });
    })
}

// start

window.addEventListener('load', async () => {
    setTimeout(() => {
        console.log(storageCache.delay);
        console.log(Number(storageCache.delay));
        delayInput.value = Number(storageCache.delay);
        form.addEventListener('submit', saveSettings);
    }, 300);
})

async function saveSettings() {
    let n = delayInput.value;
    storageCache.delay = n;
    await updateStorage();
    alert('settings saved');
}