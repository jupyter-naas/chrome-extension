console.log("content.naas.js");

let tries = 0;

const getToken = () => {
  chrome.storage.local.get(null, (storage) => {
    try {
      let { access_token } = JSON.parse(
        localStorage.getItem("sb-platform-auth-token")
      );
      if (!access_token) {
        return;
      }

      if (storage.bearerToken && storage.access_token == access_token) {
        return;
      }

      console.log("updating access token");
      chrome.storage.local.set({ access_token });
    } catch (error) {
      console.log(error);

      if (tries > 2) {
        return;
      }
      tries++;
      setTimeout(() => {
        getToken();
      }, 1000);
    }
  });
};

getToken();
