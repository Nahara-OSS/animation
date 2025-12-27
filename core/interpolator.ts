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

/**
 * Submodule for interpolating the values.
 *
 * ```typescript
 * interpolate(
 *     { type: "preset", preset: "linear" },
 *     { time: 0, value: [0] },
 *     { time: 1, value: [2] },
 *     0.5
 * );
 * ```
 *
 * @module
 */

import { type VectorLike, vLerp } from "./vector.ts";
import type { KeyframeData } from "./timeline.ts";

/**
 * The interpolator contains the information on how {@link interpolate()} should interpolate the values from a pair of
 * vector and time value.
 */
export type Interpolator<V extends VectorLike> = PresetInterpolator | BezierInterpolator<V>;

/**
 * Get the value by interpolating between 2 keyframes at specific time.
 *
 * @param interpolator The interpolator.
 * @param a The keyframe data for first keyframe.
 * @param b The second keyframe data for second keyframe.
 * @param time The current time value.
 * @returns A value obtained from interpolating between 2 keyframes.
 */
export function interpolate<V extends VectorLike>(
    interpolator: Interpolator<V>,
    a: KeyframeData<V>,
    b: KeyframeData<V>,
    time: number,
): V {
    if (a.time > b.time) throw new Error(`Keyframes order is invalid`);
    if (time < a.time) return a.value;
    if (time > b.time) return b.value;

    switch (interpolator.type) {
        case "preset":
            return preset(interpolator, a, b, time);
        case "bezier":
            return bezier(interpolator, a, b, time);
        default:
            return vLerp(a.value, b.value, (time - a.time) / (b.time - a.time));
    }
}

/**
 * Interpolate the values with preset function. All preset functions can be found in {@link presetFunctions}.
 */
export interface PresetInterpolator {
    readonly type: "preset";
    readonly preset: Preset;
}

/**
 * Preset names.
 */
export type Preset =
    | "linear"
    | `sine-${"in" | "out" | "in-out"}`
    | `cubic-${"in" | "out" | "in-out"}`;

function preset<V extends VectorLike>(
    interpolator: PresetInterpolator,
    a: KeyframeData<V>,
    b: KeyframeData<V>,
    time: number,
): V {
    const progress = (time - a.time) / (b.time - a.time);
    return vLerp(a.value, b.value, presetFunctions[interpolator.preset](progress));
}

/**
 * A map of all preset function names to preset function. Typically the keys of this map is used to present all possible
 * options that user can use in UI.
 */
export const presetFunctions: Record<Preset, (x: number) => number> = {
    "linear": (x) => x < 0 ? 0 : x > 1 ? 1 : x,
    "sine-in": (x) => 1 - Math.cos((x * Math.PI) / 2),
    "sine-out": (x) => Math.sin((x * Math.PI) / 2),
    "sine-in-out": (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    "cubic-in": (x) => x ** 3,
    "cubic-out": (x) => 1 - ((1 - x) ** 3),
    "cubic-in-out": (x) => x < 0.5 ? 4 * (x ** 3) : 1 - ((-2 * x + 2) ** 3) / 2,
};

/**
 * Interpolate the values with cubic bezier curve. All control points are in absolute coordinates, including time and
 * values.
 */
export interface BezierInterpolator<V extends VectorLike> {
    readonly type: "bezier";
    readonly cp1: KeyframeData<V>;
    readonly cp2: KeyframeData<V>;
}

function bezier<V extends VectorLike>(
    interpolator: BezierInterpolator<V>,
    cp0: KeyframeData<V>,
    cp3: KeyframeData<V>,
    time: number,
): V {
    const { cp1, cp2 } = interpolator;
    let start = 0, end = 1;

    while (Math.abs(end - start) > 1e-6) {
        const mid = (start + end) / 2;
        const curr = bezierKeyframe(cp0, cp1, cp2, cp3, mid);

        if (curr.time > time) {
            end = mid;
        } else if (curr.time < time) {
            start = mid;
        } else {
            return curr.value;
        }
    }

    return bezierKeyframe(cp0, cp1, cp2, cp3, start).value;
}

function bezierKeyframe<V extends VectorLike>(
    cp0: KeyframeData<V>,
    cp1: KeyframeData<V>,
    cp2: KeyframeData<V>,
    cp3: KeyframeData<V>,
    progress: number,
): KeyframeData<V> {
    const cp01 = lerpKeyframe(cp0, cp1, progress);
    const cp12 = lerpKeyframe(cp1, cp2, progress);
    const cp23 = lerpKeyframe(cp2, cp3, progress);
    const cp012 = lerpKeyframe(cp01, cp12, progress);
    const cp123 = lerpKeyframe(cp12, cp23, progress);
    return lerpKeyframe(cp012, cp123, progress);
}

function lerpKeyframe<V extends VectorLike>(a: KeyframeData<V>, b: KeyframeData<V>, progress: number): KeyframeData<V> {
    return {
        time: a.time * (1 - progress) + b.time * progress,
        value: vLerp(a.value, b.value, progress),
    };
}
