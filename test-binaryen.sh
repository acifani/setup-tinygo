#!/bin/sh

# Checks that Binaryen is not installed
if [ -x "$(command -v wasm-opt)" ]; then
    echo 'Error: Binaryen is installed.' >&2
    exit 1
fi
