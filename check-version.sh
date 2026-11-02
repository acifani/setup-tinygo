#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply tinygo version argument"
  exit 1
fi

if ! tinygo_version="$(tinygo version)"; then
  echo "Unable to read tinygo version"
  exit 1
fi
echo "Found tinygo version '$tinygo_version'"
case "$tinygo_version" in
  "tinygo version "*)
    actual_version=${tinygo_version#tinygo version }
    actual_version=${actual_version%% *}
    ;;
  *)
    echo "Unexpected version output"
    exit 1
    ;;
esac
if [ "$actual_version" != "$1" ]; then
  echo "Unexpected version"
  exit 1
fi
