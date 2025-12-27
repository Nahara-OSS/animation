# Nahara's Animation

Package for keyframe-based animations.

```typescript
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
```

## Modules

- `/`: The primary module containing everything.
- `/core`: The core module containing just the keyframe, timeline and value vector implementation. If for some reason
  you can't use tree-shaking, you may choose to import the components individually.
- `/utils`: Utility module that can be used with core module. Contains the goodies like updater function factory for
  example.

## License

MIT License.
