/*
 * MIT License
 *
 * Copyright (c) 2024 Joshua Horvath
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import document from "document";
import clock from "clock";
import * as newfile from "./newfile";
import { me as appbit } from "appbit";
import { today as activity } from "user-activity";
import { battery } from "power";
import { FitFont } from 'fitfont'

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const sunLabel = document.getElementById("sunLabel");
const monLabel = document.getElementById("monLabel");
const tueLabel = document.getElementById("tueLabel");
const wedLabel = document.getElementById("wedLabel");
const thuLabel = document.getElementById("thuLabel");
const friLabel = document.getElementById("friLabel");
const satLabel = document.getElementById("satLabel");
const stepCountLabel = document.getElementById("stepCountLabel");
const floorsLabel = document.getElementById("floorsLabel");
const tempLabel = document.getElementById("tempLabel");
const batteryLabel = document.getElementById("batteryLabel");
const batteryIcon = document.getElementById("batteryIcon");

const timeLabel = new FitFont({ 
  id:'timeLabel',               // id of the symbol in the index.gui
  font:'Pocket_Calculator_110', // name of the generated font folder
  halign: 'middle' 
})

const dateLabel = new FitFont({ 
  id:'dateLabel',               // id of the symbol in the index.gui
  font:'Pocket_Calculator_55',  // name of the generated font folder
  halign: 'middle'
})

const amLabel = new FitFont({ 
  id:'amLabel',                 // id of the symbol in the index.gui
  font:'Pocket_Calculator_35',  // name of the generated font folder
  halign: 'end' 
})

const pmLabel = new FitFont({ 
  id:'pmLabel',                 // id of the symbol in the index.gui
  font:'Pocket_Calculator_35',  // name of the generated font folder
  halign: 'end' 
})

/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {
  updateDayField(evt);
  amPmDisplay(evt);
  updateTimeDisplay(evt);
  updateDateField(evt);
  updateExerciseFields();
  updateBattery();
};

/**
 * Updates display of time information. 
 * @param {*} evt 
 */
function updateTimeDisplay(evt) {
  // get time information from API
  let todayDate = evt.date;
  let rawHours = todayDate.getHours();

  // 12 hour format
  let hours = rawHours % 12 || 12;

  let mins = todayDate.getMinutes();
  let displayMins = zeroPad(mins);

  // display time on main clock
  timeLabel.text = `${hours}:${displayMins}`;
}

/**
 * Add zero in front of numbers < 10
 * @param {number} i
 */
function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/**
 * Updates display of AM and PM indicators. 
 * @param {*} rawHours 
 */
function amPmDisplay(evt) {
  let rawHours = evt.date.getHours();

  if (rawHours < 12) {
    amLabel.text = "AM";
    pmLabel.text = "";
  } else {
    amLabel.text = "";
    pmLabel.text = "PM";
  }
}

/**
 * Sets current date in GUI. 
 * @param {*} evt 
 */
function updateDateField(evt) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let month = monthNames[evt.date.getMonth()];
  let dayOfMonth = evt.date.getDate();
  let year = evt.date.getUTCFullYear();

  dateLabel.text = `${month}` + " " + `${dayOfMonth}` + " " + `${year}`;
}

/**
 * Updates day of week displayed. 
 * @param {*} evt 
 */
function updateDayField(evt) {
  // reset fields
  sunLabel.text = "";
  monLabel.text = "";
  tueLabel.text = "";
  wedLabel.text = "";
  thuLabel.text = "";
  friLabel.text = "";
  satLabel.text = "";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let index = evt.date.getDay();
  let day = dayNames[index];

  switch (index) {
    case 0:
      sunLabel.text = day;
      break;
    case 1:
      monLabel.text = day;
      break;
    case 2:
      tueLabel.text = day;
      break;
    case 3:
      wedLabel.text = day;
      break;
    case 4:
      thuLabel.text = day;
      break;
    case 5:
      friLabel.text = day;
      break;
    case 6:
      satLabel.text = day;
  }
}

/**
 * Updates exercise fields in the GUI. 
 */
function updateExerciseFields() {
  if (appbit.permissions.granted("access_activity")) {
    stepCountLabel.text = getSteps().formatted;
    floorsLabel.text = activity.adjusted.elevationGain;
  } else {
    stepCountLabel.text = "----";
    floorsLabel.text = "----";
  }
}

/**
 * Gets and formats user step count for the day.
 * @returns 
 */
function getSteps() {
  let val = activity.adjusted.steps || 0;
  return {
    raw: val,
    formatted:
      val > 999
        ? `${Math.floor(val / 1000)},${("00" + (val % 1000)).slice(-3)}`
        : val,
  };
}

/**
 * Receive and process new tempature data. 
 */
newfile.initialize(data => {
  if (appbit.permissions.granted("access_location")) {
    data = toFahrenheit(data);
    let degreeSymbol = "\u00B0";
    tempLabel.text = `${data.temperature}` + degreeSymbol + `F`;
  } else {
    tempLabel.text = "----";
  }
});

/**
* Convert temperature to Fahrenheit
* @param {object} data WeatherData
*/
function toFahrenheit(data) {

  if (data.unit.toLowerCase() === "celsius") {
     data.temperature =  Math.round((data.temperature * 1.8) + 32);
     data.unit = "Fahrenheit";
  }
  return data
}

/**
 * Update the displayed battery level. 
 * @param {*} charger 
 * @param {*} evt 
 */
battery.onchange = (charger, evt) => {
  updateBattery();
};

/**
 * Updates the battery battery icon and label.
 */
function updateBattery() {
  updateBatteryLabel();
  updateBatteryIcon();
}

/**
 * Updates the battery lable GUI for battery percentage. 
 */
function updateBatteryLabel() {
  let percentSign = "&#x25";
  batteryLabel.text = battery.chargeLevel + percentSign;
}

/**
 * Updates what battery icon is displayed. 
 */
function updateBatteryIcon() {
  const minFull = 70;
  const minHalf = 30;
  
  if (battery.charging) {
    batteryIcon.image = "battery-charging.png"
  } else if (battery.chargeLevel > minFull) {
    batteryIcon.image = "battery-full.png"
  } else if (battery.chargeLevel < minFull && battery.chargeLevel > minHalf) {
    batteryIcon.image = "battery-half.png"
  } else if (battery.chargeLevel < minHalf) {
    batteryIcon.image = "battery-low.png"
  }
}
