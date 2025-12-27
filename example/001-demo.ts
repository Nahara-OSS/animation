/*
 * The MIT License (MIT)
 *
 * Copyright © 2025 The Nahara's Creative Suite contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { type Timeline, timelineValue, utils } from "@nahara/animation";

type Color = [r: number, g: number, b: number];
type ColorTimeline = Timeline<Color>;

let timeline: ColorTimeline = {
    keyframes: [
        { id: "r", time: 0, value: [1, 0, 0] },
        { id: "g", time: 1, value: [0, 1, 0] },
        { id: "b", time: 2, value: [0, 0, 1] },
    ],
    interpolators: [
        { type: "preset", preset: "linear" },
        { type: "preset", preset: "linear" },
    ],
};

for (let t = 0; t <= 2; t += 0.1) {
    console.log("t =", t, "/", "color =", timelineValue(timeline, t));
}

timeline = utils.updater.insertKeyframe("m", 3, [1, 0, 1])(timeline);
timeline = utils.updater.changeKeyframe("r", (k) => ({ ...k, value: [1, 0.2, 0.1] }))(timeline);
timeline = utils.updater.dropKeyframe("m")(timeline);

console.log(timeline);
