# How to Get Started

install node js globally or in working dir

after cloning repo 

```
cd epic-dash-electron
npm install --save-dev electron
npm install
npm start
```

a window should open with the app running

# Testing post requests

go to settings, type something in the pool, then click apply

# High level structure explanation

there is a settings file which I eventually aim on integrating with a page or modal ui to edit the server address, request interval etc.
I was inspired to include a production value so that important logging information can just be left lying around and not be annoying. also used to remove dev tools