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
 * Submodule for vector operations that can be used on vector-like objects.
 *
 * ```typescript
 * vAdd([1, 2], [3, 4]);
 * vSub({ x: 5, y: 6 }, { x: 7, y: 8 });
 * vScale({ r: 1, g: 0, b: 1 }, 1.2);
 * ```
 *
 * @module
 */

/**
 * A generic type for tuple-like or struct-like vector representations.
 *
 * ```typescript
 * // Tuple-like vector
 * const x = [1, 2, 3];
 *
 * // Struct-like vector
 * const color = { r: 0, g: 1, b: 0, a: 1 };
 * ```
 */
export type VectorLike = readonly number[] | Readonly<Record<PropertyKey, number>>;

/**
 * Add 2 values from each component of the vectors.
 *
 * @param a The vector A.
 * @param b The vector B.
 * @returns A new vector.
 */
export function vAdd<V extends VectorLike>(a: V, b: V): V {
    if (a instanceof Array && b instanceof Array) {
        return a.map((v, i) => v + b[i]) as unknown as V;
    } else if (!(a instanceof Array) && !(b instanceof Array)) {
        return Object.fromEntries(Object.entries(a).map(([key, v]) => [key, v + b[key]])) as V;
    } else {
        throw new Error("Vector kind mismatch");
    }
}

/**
 * Subtract values from vector A by value in vector B.
 *
 * @param a The vector A.
 * @param b The vector B.
 * @returns A new vector.
 */
export function vSub<V extends VectorLike>(a: V, b: V): V {
    if (a instanceof Array && b instanceof Array) {
        return a.map((v, i) => v - b[i]) as unknown as V;
    } else if (!(a instanceof Array) && !(b instanceof Array)) {
        return Object.fromEntries(Object.entries(a).map(([key, v]) => [key, v - b[key]])) as V;
    } else {
        throw new Error("Vector kind mismatch");
    }
}

/**
 * Multiply the components of a vector by a scalar value.
 *
 * @param a The vector.
 * @param scale The scaling factor.
 * @returns A new vector.
 */
export function vScale<V extends VectorLike>(a: V, scale: number): V {
    if (a instanceof Array) {
        return a.map((v) => v * scale) as unknown as V;
    } else {
        return Object.fromEntries(Object.entries(a).map(([key, v]) => [key, v * scale])) as V;
    }
}

/**
 * Linearly interpolates all components of each vector.
 *
 * @param a The vector A.
 * @param b The vector B.
 * @param progress The interpolation progress from A to B.
 * @returns A new vector.
 */
export function vLerp<V extends VectorLike>(a: V, b: V, progress: number): V {
    return vAdd(vScale(a, 1 - progress), vScale(b, progress));
}
