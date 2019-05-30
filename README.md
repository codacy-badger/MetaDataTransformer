# MetaDataTransformer
A typescript transpiler wrapper with reflection capabilities

## Important notice
This project is not stable and there are no plans to support the same features as the typescript cli. Maybe when the typescript team has decided on if, how and when they will support easy transformers pluggability I will tear the transformer out of this project and provide it standalone.

## Prerequisites
 - npm

## How to run
 - Open the path "MetaDataTransformer/MetaDataTransformerUsage" in a command line terminal
 - Run `npm run pack`
 - Open "MetaDataTransformer/MetaDataTransformerUsage/test.html" in a browser and take a look at the console output

## CLI

```
usage: tsca [-h] [-v] <command> ...

Typescript transpiler with reflection capabilities.

Positional arguments:
  <command>
    build        Transpiles the given typescript files

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --verbose  Show extra logging detail
  
usage: tsca build [-h] --pattern PATTERN [--out-dir OUTDIR]
                  [--out-file OUTFILE] [--root-dir ROOTDIR]
```
