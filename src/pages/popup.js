const storageCache = {};

// get storage data
chrome.storage.local.get(null, (items) => {
    Object.assign(storageCache, items);
    updateDom();
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




// #start here
const activationForm = document.querySelector('#activationForm');
const mainAlert = document.querySelector('#mainAlert');
const naasTokenInput = document.querySelector('#naasToken');
const confirmBtn = document.querySelector('#activationForm button');

function updateDom() {
    if (storageCache.status == true) {

        if (storageCache.cookies.li_at == '' || storageCache.cookies.li_at == 'delete me') {
            mainAlert.innerHTML = `Please login to linkedIn. <a href="https://www.linkedin.com" target="_blank">Login now</a>`;
            mainAlert.classList.add('alert-danger');
            return;
        }

        mainAlert.innerText = "Naas Token connected successfully."
        mainAlert.classList.add('alert-success');
        mainAlert.classList.remove('alert-info');
        return;
    }


    mainAlert.innerText = "Please verify your Naas token."
    activationForm.classList.remove('visually-hidden');
    activationForm.addEventListener('submit', setBearerToken);
}

async function setBearerToken(e) {
    e.preventDefault();

    let inputToken = naasTokenInput.value.trim()

    if (inputToken.length < 20) {
        alert('Please provide a valid Naas Token.');
        return;
    }

    confirmBtn.classList.add('disabled');
    confirmBtn.innerText = "Please wait.."

    let bearerToken = await getBearerToken(inputToken);

    if (bearerToken != false) {
        storageCache.bearerToken = bearerToken;
        storageCache.naasToken = inputToken;
        storageCache.status = true;

        await updateStorage();
        window.location.reload();
    } else {

        mainAlert.innerText = "Provided token is not valid.";
        mainAlert.classList.add('alert-danger');

        confirmBtn.classList.remove('disabled');
        confirmBtn.innerText = "Confirm"

    }


}

async function getBearerToken(naasToken) {
    try {
        let res = await fetch(`https://auth.naas.ai/bearer/jupyterhubtoken?token=${naasToken}`);
        res = await res.json();

        if (res.access_token) {
            return res.access_token;
        } else {
            console.log(res);
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}