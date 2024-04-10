#include <Wire.h>
#include <FastLED.h>
#define LED_PIN 2
#define NUM_LEDS 60
#define RAWDATA_BUFFLEN 250 
CRGB leds[NUM_LEDS];

/*
#include "Adafruit_DRV2605.h"
Adafruit_DRV2605 drv;
float HRreading = 0;
uint8_t effect = 15;
unsigned long cardiacCycle;
bool toggle = false; 
*/

#include "MAX30105.h"
MAX30105 particleSensor;

#include "max32664.h"
#define RESET_PIN 04
#define MFIO_PIN 03
#define RAWDATA_BUFFLEN 250
max32664 MAX32664(RESET_PIN, MFIO_PIN, RAWDATA_BUFFLEN);
void mfioInterruptHndlr(){
}
void enableInterruptPin(){
  attachInterrupt(digitalPinToInterrupt(MAX32664.mfioPin), mfioInterruptHndlr, FALLING);
}
void loadAlgomodeParameters(){
  algomodeInitialiser algoParameters;
  algoParameters.calibValSys[0] = 120;
  algoParameters.calibValSys[1] = 122;
  algoParameters.calibValSys[2] = 125;
  algoParameters.calibValDia[0] = 80;
  algoParameters.calibValDia[1] = 81;
  algoParameters.calibValDia[2] = 82;
  algoParameters.spo2CalibCoefA = 1.5958422;
  algoParameters.spo2CalibCoefB = -34.659664;
  algoParameters.spo2CalibCoefC = 112.68987;
  MAX32664.loadAlgorithmParameters(&algoParameters);
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Wire.begin(); 
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 100); 
  FastLED.clear(); 
  FastLED.show(); 

  if (particleSensor.begin() == false) {
    Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  particleSensor.setup();

  loadAlgomodeParameters();
  int result = MAX32664.hubBegin();
  if (result == CMD_SUCCESS){
    Serial.println("Sensorhub begin!");
  }else{
    while(1){
      Serial.println("Could not communicate with the sensor! please make proper connections");
      delay(1000);
    }
  }
  bool ret = MAX32664.startBPTcalibration();
  while(!ret){
    delay(1000);
    ret = MAX32664.startBPTcalibration();
  }
  delay(1000);
  ret = MAX32664.configAlgoInEstimationMode();
  while(!ret){
    ret = MAX32664.configAlgoInEstimationMode();
    delay(1000);
  }

  /*
  if (!drv.begin()) {
    Serial.println("Could not find DRV2605");
    while (1) delay(10);
  }
  drv.selectLibrary(1);
  drv.setMode(DRV2605_MODE_INTTRIG); 
  */

  Serial.println("Getting the device ready..");
  delay(1000);
}

void loop() {
  // Your non-serial code goes here. It will execute regardless of whether
  // there is serial data available or not.

  uint8_t num_samples = MAX32664.readSamples();
  if(num_samples){
    Serial.print("sys = ");
    Serial.print(MAX32664.max32664Output.sys);
    Serial.print(", dia = ");
    Serial.print(MAX32664.max32664Output.dia);
    Serial.print(", hr = ");
    Serial.print(MAX32664.max32664Output.hr);
    Serial.print(", spo2 = ");
    Serial.print(MAX32664.max32664Output.spo2);
    Serial.print(", ppg = "); 
    Serial.println(particleSensor.getIR()); 
    delay(100); 
  }
    /*
    if (toggle == true) {
      if (HRreading != 0) {
        drv.setWaveform(0, effect); 
        drv.setWaveform(1, 0);      
        drv.go();
        cardiacCycle = 60000.0 / (HRreading - 18.0); 
        delay((int)cardiacCycle); 
      } else {
        delay(100); 
      }
    } else {
      delay(100); 
    }
  } else {
    delay(100);
  }
  */
}

void serialEvent() {
  while (Serial.available()) {
    char command = Serial.read();
    Serial.flush(); // Clear the serial buffer
    if (command == '0') {
      FastLED.clear();  
      FastLED.show();  
    }
    if (command == '1') {
      leds[0] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }  
    if (command == '2') {
      leds[1] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    if (command == '3') {
      leds[2] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    if (command == '4') {
      leds[3] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    if (command == '5') {
      leds[4] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    if (command == '6') {
      leds[5] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    if (command == '7') {
      leds[6] = CRGB(128,  0,  128);  
      FastLED.delay(100);  
      FastLED.show();  
    }
    /*
    if (command == '8') {
      toggle = true; 
    }
    if (command == '9') {
      toggle = false; 
    }
    if (command == 'a') {
      effect = 7; 
    }
    if (command == 'b') {
      effect = 13; 
    }
    if (command == 'c') {
      effect = 107; 
    }
    if (command == 'd') {
      effect = 58; 
    }
    */
  }
}

