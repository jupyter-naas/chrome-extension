const notificationsWrapper = document.querySelector("#notifications");
const jobsForm = document.querySelector("#jobsForm");
const naasTokenForm = document.querySelector("#naasTokenForm");

function addNotification(text, alertClass = "alert-info") {
  if (notificationsWrapper.innerText.includes(text)) {
    return;
  }

  let div = document.createElement("div");
  div.className = `alert alert-dismissible ${alertClass}`;
  div.innerHTML = `
        <span class="">${text}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" ></button>
    `;
  notificationsWrapper.append(div);
}

async function getBearerToken(naasToken) {
  return new Promise((resolve, reject) => {
    fetch(`https://auth.naas.ai/bearer/jupyterhubtoken?token=${naasToken}`)
      .then((resp) => {
        resp
          .json()
          .then((result) => {
            if (result.access_token) {
              return resolve(result.access_token);
            } else {
              return reject("Provided token is not valid.");
            }
          })
          .catch((err) => {
            return reject(err);
          });
      })
      .catch((err) => {
        return reject(err);
      });
  });
}

function checkConnections() {
  chrome.cookies.getAll(
    {
      domain: ".www.linkedin.com",
      name: "li_at",
    },
    ([cookie]) => {
      if (cookie) {
        connectionStatus_linkedin.classList.add("bg-success");
        connectionStatus_linkedin.classList.remove("bg-danger");
      }
    }
  );
}

function setupJobsSections(jobsPayload) {
  try {
    let options = JSON.parse(jobsPayload);
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      let item = `<option value="${i}">${option.name}</option>`;
      jobsForm.jobName.insertAdjacentHTML("beforeend", item);
    }

    jobsForm.onsubmit = (e) => {
      e.preventDefault();

      const job = options[+jobsForm.jobName.value];

      jobsForm.submitBtn.value = "Running";
      jobsForm.submitBtn.classList.add("disabled");

      const payload = job?.action?.payload?.replace(
        "%s",
        jobsForm.payload.value
      );

      fetch(job?.action?.url, {
        method: "POST",
        payload: payload,
      })
        .then((resp) => {
          if (resp.status == 200) {
            addNotification(
              `${job.name} is started successfully.`,
              "alert-success"
            );
          } else {
            throw `Error ${resp.status} received from API.`;
          }
        })
        .catch((err) => {
          addNotification(err, "alert-danger");
        })
        .finally(() => {
          jobsForm.reset();
          jobsForm.submitBtn.value = "Run";
          jobsForm.submitBtn.classList.remove("disabled");
        });
    };
  } catch (error) {
    addNotification(error, "alert-danger");
    console.log(error);
  }
}

naasTokenForm.onsubmit = (e) => {
  e.preventDefault();
  naasTokenForm.submitBtn.innerText = "Saving...";
  getBearerToken(naasTokenForm.token.value)
    .then((resp) => {
      chrome.storage.local.set({ bearerToken: resp }, () => {
        notificationsWrapper.innerHTML = "";
        addNotification("Naas token set successfully!", "alert-success");
        naasTokenForm.classList.add("visually-hidden");
        checkConnections();
      });
      console.log(resp);
    })
    .catch((err) => {
      addNotification(err, "alert-danger");
    })
    .finally(() => {
      naasTokenForm.submitBtn.innerText = "Save";
    });
};

chrome.storage.local.get(null, (storage) => {
  if (storage.jobsPayload) {
    setupJobsSections(storage.jobsPayload);
  }

  if (!storage.bearerToken || storage.bearerToken == "") {
    addNotification("Please set your Naas token.", "alert-warning");
    naasTokenForm.classList.remove("visually-hidden");
  } else {
    checkConnections();
  }
});
