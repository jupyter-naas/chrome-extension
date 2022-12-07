const storageCache = {};
let storageLoaded = false;
// get storage data
chrome.storage.local.get(null, (items) => {
    Object.assign(storageCache, items);
    storageLoaded = true;
});

// keep data updated
chrome.storage.onChanged.addListener(async (changes, area) => {

    while (storageLoaded == false) {
        await new Promise((resolve) => { setTimeout(resolve, 100) })
    }

    for (const item in changes) {
        storageCache[item] = changes[item].newValue;
    }
    updateBadge()
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
chrome.runtime.onInstalled.addListener(async function (details) {
    while (storageLoaded == false) {
        await new Promise((resolve) => { setTimeout(resolve, 100) })
    }
    if (details.reason == 'install') {
        // set default values
        storageCache.naasToken = '';
        storageCache.bearerToken = '';
        storageCache.email = '';
        storageCache.status = false;
        storageCache.cookies = await getCookies();
        await updateStorage();

        chrome.alarms.create(
            'checkLoginStatus',
            {
                delayInMinutes: 1,
                periodInMinutes: 60
            }
        )

    }

})

// when cookies change
chrome.cookies.onChanged.addListener(async (obj) => {
    while (storageLoaded == false) {
        await new Promise((resolve) => { setTimeout(resolve, 100) })
    }

    if (obj.cookie.name == 'JSESSIONID') {
        // await new Promise((resolve) => { setTimeout(resolve, 1000) });
        if (obj.removed) {
            console.log('cookie removed');
            return
        }

        storageCache.cookies = await getCookies();
        await updateStorage();
        console.log(storageCache.cookies);

        if (storageCache.bearerToken == '') {
            console.log('bearer token not found');
            return
        }

        // send event update

        let res = await sendEventUpdate();
        console.log('data sent response:' + res);
        // console.log();
    }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
    while (storageLoaded == false) {
        await new Promise((resolve) => { setTimeout(resolve, 100) })
    }

    if (alarm.name == 'checkLoginStatus') {
        if (storageCache.cookies.li_at == '') {
            chrome.notifications.create(
                'login',
                {
                    iconUrl: '/images/logo.png',
                    title: 'NAAS',
                    message: 'Please login to linkedIn.',
                    type: 'basic'
                }
            )

        }
    }
})

chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId == 'login') {
        openTab({
            url: 'https://www.linkedin.com'
        })
    }
})




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case '':

            break;
        default:
            break;
    }

    return true;
})


async function sendEventUpdate() {
    let eventData = [
        {
            "event_type": "linkedin.cookies",
            "event_content": {
                "jsessionid": storageCache.cookies.jsessionid,
                "li_at": storageCache.cookies.li_at
            }
        }
    ]

    eventData = JSON.stringify(eventData);

    console.log(eventData);
    try {
        let res = await fetch('https://events.naas.ai/events', {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + storageCache.bearerToken,
                "Content-Type": "application/json"
            },
            body: eventData,
            redirect: 'follow'
        })

        res = await res.json();
        console.log(res);

        if (res.entries && res.entries.length == 1) {
            return true;
        } else {
            // console.log(res);
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getUserEmail(bearerToken) {
    try {
        let res = await fetch('https://auth.naas.ai/users/me', {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + bearerToken
            }
        })

        res = await res.json();
        if (res.username) {
            return res.username;
        } else {
            console.log(res);
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getCookies() {
    let res = {
        jsessionid: '',
        li_at: ''
    }

    let jsessionid = await chrome.cookies.getAll(
        {
            domain: '.www.linkedin.com',
            name: "JSESSIONID"
        }
    )


    let li_at = await chrome.cookies.getAll(
        {
            domain: '.www.linkedin.com',
            name: "li_at"
        }
    )

    if (jsessionid[0]) {
        res.jsessionid = jsessionid[0].value;
    }
    // console.log(li_at);
    if (li_at[0]) {
        res.li_at = li_at[0].value;
    }

    return res;
}


function openTab(options) {
    return new Promise(resolve => {
        chrome.tabs.create(options, (tab) => {
            resolve(tab);
        });
    });
}

function updateBadge() {
    if (storageCache.status == false || storageCache.cookies.li_at == '') {
        chrome.action.setBadgeText({ text: "!" })
        chrome.action.setBadgeBackgroundColor({ color: 'red' })

    } else {
        chrome.action.setBadgeText({ text: "" })
        chrome.action.setBadgeBackgroundColor({ color: 'green' })
    }
}