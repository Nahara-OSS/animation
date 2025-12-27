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
 * An optional module providing the updating functions for altering the timeline state. An updater is a function that
 * produces a new state from previous state. Updaters are typically used as parameter for `useState()` in React/Preact:
 *
 * ```typescriptreact
 * function MyComponent() {
 *     const [timeline, setTimeline] = useState<Timeline>(initialTimelineState);
 *
 *     function handleClick() {
 *         const id = crypto.randomUUID();
 *         const time = Math.random() * 10;
 *         const value = [Math.random()];
 *         setTimeline(insertKeyframe(id, time, value));
 *     }
 *
 *     return (
 *         <button onclick={handleClick}>Update</button>
 *     );
 * }
 * ```
 *
 * @module
 */

import { type KeyframeData, type Timeline, type VectorLike, vScale } from "../core/mod.ts";
import { binarySearch } from "../internal/search.ts";

/**
 * The type for timeline updaters.
 */
export type TimelineUpdater<V extends VectorLike> = <T extends Timeline<V>>(timeline: T) => T;

/**
 * Create a timeline updater to insert a keyframe.
 *
 * @param id The identifier of the new keyframe to insert.
 * @param time The time position to insert the keyframe.
 * @param value The value of the new keyframe.
 * @returns An updater that produces a new timeline state with new keyframe.
 */
export function insertKeyframe<V extends VectorLike>(id: string, time: number, value: V): TimelineUpdater<V> {
    return (timeline) => {
        const { index } = binarySearch(timeline.keyframes, (k) => k.time - time);
        const copyInterpolator = timeline.interpolators[index - 1] ??
            timeline.interpolators[index - 2] ??
            timeline.interpolators[index];

        return {
            ...timeline,
            keyframes: [
                ...timeline.keyframes.slice(0, index),
                { id, time, value },
                ...timeline.keyframes.slice(index),
            ],
            interpolators: [
                ...timeline.interpolators.slice(0, index),
                copyInterpolator,
                ...timeline.interpolators.slice(index),
            ],
        };
    };
}

/**
 * Create a timeline updater to modify an existing keyframe.
 *
 * @param id The identifier of the keyframr to update.
 * @param updater The keyframe updater or data that will be used to update the keyframe based on its previous state.
 * @returns An updater that produces a new timeline state with new keyframe.
 */
export function changeKeyframe<V extends VectorLike>(
    id: string,
    updater: ((data: KeyframeData<V>) => KeyframeData<V>) | KeyframeData<V>,
): TimelineUpdater<V> {
    return (timeline) => {
        const index = timeline.keyframes.findIndex((k) => k.id == id);
        if (index == -1) return timeline;

        const keyframes = [...timeline.keyframes.slice(0, index), ...timeline.keyframes.slice(index + 1)];
        const newData = typeof updater == "function" ? updater(timeline.keyframes[index]) : updater;
        const newIndex = binarySearch(keyframes, (k) => k.time - newData.time).index;

        if (index == newIndex) {
            return {
                ...timeline,
                keyframes: [
                    ...timeline.keyframes.slice(0, index),
                    { id, ...newData },
                    ...timeline.keyframes.slice(index + 1),
                ],
            };
        }

        return {
            ...timeline,
            keyframes: [
                ...keyframes.slice(0, newIndex),
                { id, ...newData },
                ...keyframes.slice(newIndex),
            ],
        };
    };
}

/**
 * Create a new timeline updater to drop a keyframe with specific identifier.
 *
 * @param id The identifier of the keyframe to drop.
 * @returns An updater that produces a new timeline state with new keyframe.
 */
export function dropKeyframe<V extends VectorLike>(id: string): TimelineUpdater<V> {
    return (timeline) => {
        const index = timeline.keyframes.findIndex((k) => k.id == id);
        if (index == -1) return timeline;

        if (timeline.keyframes.length == 1) {
            return {
                ...timeline,
                keyframes: [{ id: "default", time: 0, value: vScale(timeline.keyframes[0].value, 0) }],
                interpolators: [],
            };
        }

        const interpolatorIndex = index < timeline.interpolators.length ? index : timeline.interpolators.length - 1;

        return {
            ...timeline,
            keyframes: [
                ...timeline.keyframes.slice(0, index),
                ...timeline.keyframes.slice(index + 1),
            ],
            interpolators: [
                ...timeline.interpolators.slice(0, interpolatorIndex),
                ...timeline.interpolators.slice(interpolatorIndex + 1),
            ],
        };
    };
}
