const notificationsWrapper = document.querySelector("#notifications");

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

chrome.storage.local.get("jobsPayload", (storage) => {
  console.log(storage);
  if (storage.jobsPayload) {
    payloadForm.payload.value = storage.jobsPayload;
  }
});

payloadForm.onsubmit = (e) => {
  e.preventDefault();

  try {
    let payload = JSON.parse(payloadForm.payload.value);

    chrome.storage.local.set({ jobsPayload: payloadForm.payload.value }, () => {
      addNotification("Saved successfully!");
    });
  } catch (err) {
    addNotification(err, "alert-danger");
  }
};
