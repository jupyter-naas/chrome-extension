function sendEventUpdate(connection) {
  switch (connection) {
    case "linkedin":
      chrome.cookies.getAll(
        {
          domain: ".www.linkedin.com",
        },
        (cookies) => {
          //   console.log(cookies);
          const payload = [
            {
              event_type: "linkedin.cookies",
              event_content: {
                jsessionid: cookies.find((el) => el.name == "JSESSIONID")
                  ? cookies.find((el) => el.name == "JSESSIONID").value
                  : "",

                li_at: cookies.find((el) => el.name == "li_at")
                  ? cookies.find((el) => el.name == "li_at").value
                  : "",
              },
            },
          ];

          //   return console.log(payload);

          chrome.storage.local.get("bearerToken", (storage) => {
            if (!storage.bearerToken || storage.bearerToken == "") {
              return console.log("bearerToken not found.");
            }

            fetch("https://events.naas.ai/events", {
              method: "POST",
              headers: {
                Authorization: "Bearer " + storage.bearerToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              redirect: "follow",
            })
              .then((resp) => {
                resp.json().then((result) => {
                  console.log("event sent", result);
                  if (!result.entries) {
                    throw "err";
                  }
                });
              })
              .catch((err) => {
                chrome.notifications.create("login", {
                  iconUrl: "/images/logo.png",
                  title: "NAAS",
                  message: "Failed to sent event update.",
                  type: "basic",
                });
                console.log(err);
              });
          });
        }
      );
      break;

    default:
      console.log("invalid connection", connection);
      break;
  }
}

function openTab(options) {
  return new Promise((resolve) => {
    chrome.tabs.create(options, (tab) => {
      resolve(tab);
    });
  });
}

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// when cookies change
chrome.cookies.onChanged.addListener(async (obj) => {
  //   console.log(obj);

  if (
    obj.cookie.domain == ".www.linkedin.com" &&
    obj.cookie.name == "JSESSIONID" &&
    !obj.removed
  ) {
    // send event update
    sendEventUpdate("linkedin");
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
              iconUrl: "/images/logo.png",
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
    chrome.alarms.create("checkLoginStatus", {
      delayInMinutes: 1,
      periodInMinutes: 60,
    });
  }
});
