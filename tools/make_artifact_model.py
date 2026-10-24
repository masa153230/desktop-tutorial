#!/usr/bin/env python3
"""claude.ai のアーティファクト版に載せる骨格推定モデルを作る。

アーティファクトは .task (中身は zip) を配れないので、base64 にして JS モジュールに入れる。
アプリは .task が読めない時だけこれを読む (index.html の poseModel)。
同じモデルを二重に持たないよう、出力はリポジトリに入れない (.gitignore)。

  python3 tools/make_artifact_model.py   # → vendor/mediapipe/pose_landmarker_lite.task.js
"""
import base64, pathlib

d = pathlib.Path(__file__).resolve().parent.parent / 'vendor' / 'mediapipe'
src, out = d / 'pose_landmarker_lite.task', d / 'pose_landmarker_lite.task.js'
out.write_text('export default "' + base64.b64encode(src.read_bytes()).decode() + '";\n')
print(out, out.stat().st_size, 'bytes')
