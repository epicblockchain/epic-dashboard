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

index.js holds some html tags that have ids which are modified with jquery in the js classes.
the only class initialized is at the bottom of index which manages all the other classes (at least for now)
the HB instance initializes other classes

there is a settings file which I eventually aim on integrating with a page or modal ui to edit the server address, request interval etc.
I was inspired to include a production value so that important logging information can just be left lying around and not be annoying. also used to remove dev tools