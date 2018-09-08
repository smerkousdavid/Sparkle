'use strict';

const serial = require('serialport');
const http = require('http');
const url = require('url');

class LEDController {
    constructor(onOpen) {
        this.port = new serial('/dev/ttyMCC', {
            baudRate: 115200
        }, onOpen);

        this.current = "000000";
        this.port.on('error', err => console.log('serial port error', err));
    }

    setColor(hex) {
        this.current = hex.trim().substring(0, 6); //Make sure it's a valid hex without alpha
        this.port.write(this.current.replace('#', ''), err => {
            err && console.log('failed to write color!', err);
        });
    }

    getColor() {
        return this.current;
    }
}

console.log('Starting the light server!\n');
process.stdout.write('Connecting to serial port, connecting...');
const leds = new LEDController(() => {
    console.log('\rConnecting to serial port, connected    '); //Extra spaces to replace the previous periods 

    //Turn off the leds
    leds.setColor("000000");

    const headers = {'Content-Type': 'text/plain'};

    //Start the http server
    console.log('Starting server on port 7777');
    http.createServer((req, res) => {
        try {
            const data = url.parse(req.url);
            switch(data.pathname) {
                case '/get':
                    res.writeHead(200, headers);
                    res.write(leds.getColor());
                    break;
                case '/set':
                    leds.setColor(data.query.split('=')[1], headers);
                    res.writeHead(200);
                    res.write(leds.getColor());
                    break;
                default:
                    res.writeHead(500, headers);
                    res.write('invalid request ' + data.pathname);
                    console.log('got an invalid request', data.pathname);
                    break;
            }
        } catch(err) {
            console.log('request error', err);
            res.writeHead(500, headers);
            res.write(err);
        }
        res.end();
    }).listen(7777);
});
