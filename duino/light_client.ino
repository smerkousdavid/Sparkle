#define R_PIN 3
#define G_PIN 4
#define B_PIN 5

#define HEX_SIZE 6
#define _DEBUG 0

const char HEX_DATA[17] = "0123456789ABCDEF";
byte fromColor[3] = { 0x00, 0x00, 0x00 };
byte toColor[3] = { 0x00, 0x00, 0x00 };

void setRGB(byte r, byte g, byte b) {
  toColor[0] = r;
  toColor[1] = g;
  toColor[2] = b;

#if _DEBUG
  Serial.print(r);
  Serial.print(" ");
  Serial.print(g);
  Serial.print(" ");
  Serial.println(b);

  if(b == 0x00) {
    digitalWrite(13, LOW);
  } else if(b == 0xFF) {
    digitalWrite(13, HIGH);
  }
#endif
}

void parseHEX(char *d) {
  byte r = hex2byte(base_hex(d[0]), base_hex(d[1]));
  byte g = hex2byte(base_hex(d[2]), base_hex(d[3]));
  byte b = hex2byte(base_hex(d[4]), base_hex(d[5]));
  setRGB(r, g, b);
}

inline byte base_hex(char &c) {
  return (byte) (strchr(HEX_DATA, c) - HEX_DATA) & 0xFF;
}

inline byte hex2byte(byte fByte, byte sByte) {
  return (fByte << 4) + sByte;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(R_PIN, OUTPUT);
  pinMode(G_PIN, OUTPUT);
  pinMode(B_PIN, OUTPUT);
  
#if _DEBUG
  pinMode(13, OUTPUT);
#endif
}

void loop() {
  if(Serial.available() > 0) {
     char hexData[HEX_SIZE];
     const int count = Serial.readBytesUntil('\n', hexData, HEX_SIZE);
     hexData[count] = '\0';
     parseHEX(hexData);
  }

  if(fromColor[0] != toColor[0]) {
    fromColor[0] += (fromColor[0] > toColor[0]) ? -1 : 1;
    analogWrite(R_PIN, fromColor[0]); 
  }

  if(fromColor[1] != toColor[1]) {
    fromColor[1] += (fromColor[1] > toColor[1]) ? -1 : 1;
    analogWrite(G_PIN, fromColor[1]);
  }

  if(fromColor[2] != toColor[2]) {
    fromColor[2] += (fromColor[2] > toColor[2]) ? -1 : 1;
    analogWrite(B_PIN, fromColor[2]);
  }

  delay(1);
}
