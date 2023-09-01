# naas-chrome-extension

Process that takes data from chrome extension to sent it to naas-events-api

The repo has 2 parts:

- the chrome extension code,
- the notebook that gets the cookies and sends them to the server of each user

sample naas token `061cbea075be42ce9ff027f22e533018`


## How to build and install the extension locally

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable developer mode
6. Click on `Load unpacked extension`
7. Select the `dist` folder
8. Enjoy!
