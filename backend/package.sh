#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT/backend/build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
python3 -m pip install --disable-pip-version-check --target "$BUILD_DIR" -r "$ROOT/backend/requirements.txt"
cp "$ROOT/backend/crud_lambda.py" "$BUILD_DIR/"
(cd "$BUILD_DIR" && zip -qr "$ROOT/backend/crud_lambda.zip" .)
echo "Pacote criado em backend/crud_lambda.zip"
