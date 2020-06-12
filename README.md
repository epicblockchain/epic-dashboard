# How to Get Started

after cloning repo 

```
cd epic-dash-electron
npm install --save-dev electron
npm install
npm start
```

a window should open with the app running

# High level structure explanation

there is a settings file which I eventually aim on integrating with a page or modal ui to edit the server address, request interval etc.
I was inspired to include a production value so that important logging information can just be left lying around and not be annoying. also used to remove dev tools