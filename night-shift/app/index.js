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

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const amLabel = document.getElementById("amLabel");
const pmLabel = document.getElementById("pmLabel");
const timeLabel = document.getElementById("timeLabel");
const dateLabel = document.getElementById("dateLabel");
const tempLabel = document.getElementById("tempLabel");

/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {

  updateDateField(evt);

  // get time information from API
  let todayDate = evt.date;
  let rawHours = todayDate.getHours();

  // 12 hour format
  let hours = rawHours % 12 || 12;

  let mins = todayDate.getMinutes();
  let displayMins = zeroPad(mins);

  // display time on main clock
  timeLabel.text = `${hours}:${displayMins}`;

  amPmDisplay(rawHours)
};

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
function amPmDisplay(rawHours) {
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

  dateLabel.text = `${month}` + " " + `${dayOfMonth}` + ", " + `${year}`;
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