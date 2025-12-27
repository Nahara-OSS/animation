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
 * Submodule for handling keyframes and timelines.
 *
 * ```typescript
 * timelineValue({
 *     keyframes: [{ id: "default", time: 0, value: [1, 2, 3] }],
 *     interpolators: []
 * }, 10);
 * ```
 *
 * @module
 */

import { interpolate, type Interpolator } from "./interpolator.ts";
import { binarySearch } from "../internal/search.ts";
import type { VectorLike } from "./vector.ts";

/**
 * Represent a keyframe inside {@link Timeline}. Each keyframe stored in timeline have an identifier, which is typically
 * generated from `crypto.randomUUID()`.
 */
export interface Keyframe<V extends VectorLike> extends KeyframeData<V> {
    /**
     * The identifier of this keyframe, typically generated from `crypto.randomUUID()`, or manually declared in initial
     * state, such as `default` or `initial-0`. The identifier is required since the keyframe will be linked with UI
     * control through identifier.
     */
    readonly id: string;
}

/**
 * Represent the data of the keyframe (may be known as keyframe without identifier). This interface is only for storing
 * keyframe data.
 */
export interface KeyframeData<V extends VectorLike> {
    /**
     * The time of this keyframe.
     */
    readonly time: number;

    /**
     * The value of this keyframe. The timeline will have this value if the current time is equals to the time of this
     * keyframe. In case the time value is sitting in-between 2 keyframes, interpolation is used to interpolate between
     * 2 value vectors from 2 keyframes with a specific interpolator.
     */
    readonly value: V;
}

/**
 * Represent the data of keyframe timeline. A timeline is considered to be valid if:
 *
 * - There is at least 1 keyframe;
 * - All keyframes in the list are ordered by its time value;
 * - For `n` keyframes, there are exactly `n - 1` interpolators.
 */
export interface Timeline<V extends VectorLike> {
    /**
     * A list of keyframes, ordered by the time value. Each timeline state must have at least 1 keyframe.
     */
    readonly keyframes: readonly Keyframe<V>[];

    /**
     * A list of interpolators where each sits in-between 2 keyframes. An interpolator at index `n` sits between
     * keyframes with index `n` and `n + 1`.
     */
    readonly interpolators: readonly Interpolator<V>[];
}

/**
 * Derive a value from timeline at given time.
 *
 * - Returns the first keyframe if there is only a single keyframe in the timeline;
 * - Returns the value on keyframe if the time value equals to the keyframe;
 * - Interpolates between 2 keyframes if the time value is between them.
 *
 * @param timeline The timeline to derive.
 * @param time The time on the timeline to derive.
 * @returns A value derived from timeline at given time.
 */
export function timelineValue<V extends VectorLike>(timeline: Timeline<V>, time: number): V {
    if (timeline.keyframes.length < 1 || timeline.keyframes.length != timeline.interpolators.length + 1) {
        throw new Error(`Timeline is not valid`);
    }

    if (timeline.keyframes.length == 1) {
        return timeline.keyframes[0].value;
    }

    const result = binarySearch(timeline.keyframes, (k) => k.time - time);
    if (result.found) return result.element.value;

    const prev = timeline.keyframes[result.index - 1];
    const next = timeline.keyframes[result.index];
    const interpolator = timeline.interpolators[result.index - 1];
    if (!prev && next) return next.value;
    if (!next && prev) return prev.value;

    return interpolate(interpolator, prev, next, time);
}
