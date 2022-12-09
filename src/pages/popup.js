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

naasTokenForm.onsubmit = (e) => {
  e.preventDefault();
  naasTokenForm.submitBtn.innerText = "Saving...";
  getBearerToken(naasTokenForm.token.value)
    .then((resp) => {
      chrome.storage.local.set({ bearerToken: resp }, () => {
        notificationsWrapper.innerHTML = "";
        addNotification("Naas token set successfully!", "alert-success");
        naasTokenForm.classList.add("visually-hidden");
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
    try {
      let options = JSON.parse(storage.jobsPayload);
      for (const option of options) {
        let item = `<option value="">${option.name}</option>`;
        jobsForm.jobName.insertAdjacentHTML("beforeend", item);
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (!storage.bearerToken) {
    addNotification("Please set your naas token.", "alert-warning");
    naasTokenForm.classList.remove("visually-hidden");
  }
});
