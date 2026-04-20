# setup-tinygo

[![Check dist/](https://github.com/acifani/setup-tinygo/actions/workflows/check-dist.yml/badge.svg)](https://github.com/acifani/setup-tinygo/actions/workflows/check-dist.yml)
[![Validate](https://github.com/acifani/setup-tinygo/actions/workflows/validate.yml/badge.svg)](https://github.com/acifani/setup-tinygo/actions/workflows/validate.yml)

This action sets up a TinyGo environment for GitHub Actions.

Supported runners: `ubuntu-latest`, `ubuntu-24.04-arm`, `macos-latest`, `windows-latest`, `windows-11-arm`.

## Inputs

| Input              | Description                                     | Default  |
| ------------------ | ----------------------------------------------- | -------- |
| `tinygo-version`   | The exact TinyGo version to download and use.   | `0.40.1` |
| `install-binaryen` | Whether to install Binaryen.                    | `true`   |
| `binaryen-version` | The exact Binaryen version to download and use. | `129`    |

## Usage

### Basic

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: acifani/setup-tinygo@v3
    with:
      tinygo-version: '0.40.1'
```

### With matrix expansion

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        tinygo: ['0.39.0', '0.40.1']
    name: TinyGo ${{ matrix.tinygo }}
    steps:
      - uses: actions/checkout@v5
      - uses: acifani/setup-tinygo@v3
        with:
          tinygo-version: ${{ matrix.tinygo }}
```

### With custom Go version

TinyGo needs Go and, by default, this action will use whatever
version is available in the runner. If you want to control the
Go version, you can use `actions/setup-go` before `acifani/setup-tinygo`

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: actions/setup-go@v6
    with:
      go-version: '1.25'
  - uses: acifani/setup-tinygo@v3
    with:
      tinygo-version: '0.40.1'
```

### With custom Binaryen version

This action will install [Binaryen](https://github.com/WebAssembly/binaryen)
which is needed for building WASM on Windows and macOS.
You can customize the version with the dedicated input value

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: acifani/setup-tinygo@v3
    with:
      tinygo-version: '0.40.1'
      binaryen-version: '129'
```

### Without Binaryen

If you don't need Binaryen, you can omit the installation

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: acifani/setup-tinygo@v3
    with:
      tinygo-version: '0.40.1'
      install-binaryen: 'false'
```
