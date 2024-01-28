console.log("background.js");

import logo from "./images/logo.png";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

async function sendEventUpdate(key, value) {
  try {
    const payload = {
      secret: {
        name: key,
        value: value,
      },
    };

    const { bearerToken } = await chrome.storage.local.get("bearerToken");
    if (!bearerToken) {
      throw "bearerToken not found.";
    }

    let res = await fetch("https://api.naas.ai/secret/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status == 401) {
      chrome.storage.local.remove("bearerToken");
      chrome.storage.local.remove("access_token");
      throw "Unauthorized.";
    }

    if (res.status != 200 && res.status != 201) {
      throw "Failed to sent event update.";
    }

    console.log("Event update sent.");
  } catch (error) {
    chrome.notifications.create("login", {
      iconUrl: logo,
      title: "NAAS",
      message: "Failed to sent event update.",
      type: "basic",
    });
    console.log(error);
  }
}

function openTab(options) {
  return new Promise((resolve) => {
    chrome.tabs.create(options, (tab) => {
      resolve(tab);
    });
  });
}

async function getBearerToken(token) {
  try {
    let res = await fetch(
      `https://auth.naas.ai/bearer/workspace/longlived?token=${token}`
    );

    let { access_token } = await res.json();
    chrome.storage.local.set({ bearerToken: access_token });
    console.log("Login successful.", access_token);
  } catch (error) {
    console.log(error);
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key == "access_token" && newValue) {
      getBearerToken(newValue);
    }
  }
});

// when cookies change
chrome.cookies.onChanged.addListener(async (obj) => {
  if (obj.cookie.domain == ".www.linkedin.com" && !obj.removed) {
    switch (obj.cookie.name) {
      case "JSESSIONID":
        sendEventUpdate("JSESSIONID", obj.cookie.value);
        break;
      case "li_at":
        sendEventUpdate("li_at", obj.cookie.value);
        break;

      default:
        break;
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case "checkLoginStatus":
      chrome.cookies.getAll(
        {
          domain: ".www.linkedin.com",
          name: "li_at",
        },
        ([cookie]) => {
          if (!cookie) {
            chrome.notifications.create("login", {
              iconUrl: logo,
              title: "NAAS",
              message: "Please login to linkedIn.",
              type: "basic",
            });
          }
        }
      );
      break;

    default:
      break;
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId == "login") {
    openTab({
      url: "https://www.linkedin.com",
    });
  }
});

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason == "install") {
    openTab({
      url: "https://naas.ai",
    });

    chrome.alarms.create("checkLoginStatus", {
      delayInMinutes: 1,
      periodInMinutes: 60,
    });
  }
});
