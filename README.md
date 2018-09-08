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
