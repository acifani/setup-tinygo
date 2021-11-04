#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply tinygo version argument"
  exit 1
fi

tinygo_version="$(tinygo version)"
echo "Found tinygo version '$tinygo_version'"
if [ -z "$(echo $tinygo_version | grep $1)" ]; then
  echo "Unexpected version"
  exit 1
fi
