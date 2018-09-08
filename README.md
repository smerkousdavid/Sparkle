# Sparkle
A simple android/ios app that communicates with an LED server on a microcontroller or computer (as long as the secondary processor has serial). The duino code doesn't require any dependencies as all of the HEX/Data decoding was written by hand and the fade code is a very simple equal RGB shift loop. This project really complex at all. This repository is more of a backup of my project than it is a showcase of it, but if you want to use it here are the instructions. 

#### Installation
-------------------------
**Clone the repository**
`$ git clone https://github.com/smerkousdavid/Sparkle && cd Sparkle`

**Arduino**
Copy the the duino folder onto the microcontroller and make sure you use arduino based pin functions or you can modify the library to use your own sysfs GPIO bindings (Check out my other NEOC.GPIO library the example). 

**Server**
The server code is located under the server and is just a single node script called server.js. The default port is 7777 so you don't need to run the script as root unless /tty/ttyMCC (you should probably change to whatever serial device you're using) requires root access.
```
$ cd server
$ yarn install
$ node server.js
```

**Phone**
The react-native app uses libraries that are compatible with both Android and IOS (not tested but it should work) so there isn't any other native dev and I could have just excluded the android/ ios/ folders, but oh well.
`yarn install`
and
`yarn android` or `yarn ios`

That's it!

#### License
--------------------
Sparkle is licensed under MIT by author David Smerkous
