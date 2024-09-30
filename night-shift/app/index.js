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

import * as clock from "./clock";
import * as newfile from "./newfile";
import { toFahrenheit } from "../common/utils";
import { units } from "user-settings";
import { me as appbit } from "appbit";

const time = document.getElementById("time");
const details = document.getElementById("details");

/**
 * Initialize clock. 
 */
clock.initialize("minutes", data => {
  time.text = data.time;
});

/**
 * Receive and process new tempature data. 
 */
newfile.initialize(data => {
  if (appbit.permissions.granted("access_location")) {
    data = toFahrenheit(data);
    let degreeSymbol = "\u00B0";
    details.text = `${data.temperature}` + degreeSymbol + `F`;
  } else {
    details.text = "----";
  }
  clock.tick();
});
