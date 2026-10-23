# MediaPipe (同梱)

骨格推定に使う Google MediaPipe の部品を、CDN に頼らず GitHub Pages から配信するために同梱している。

- `vision_bundle.mjs`, `wasm/` … npm パッケージ `@mediapipe/tasks-vision@0.10.21` (Apache License 2.0)
- `pose_landmarker_lite.task` … Pose Landmarker (lite, float16, v1) のモデル
  (https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task, Apache License 2.0)

ライセンス: https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE
