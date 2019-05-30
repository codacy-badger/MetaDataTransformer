import * as ts from 'typescript';
import * as glob from 'glob';
import * as path from 'path';

import { metadataTransformer } from './transformer';
import { Logger } from './logger';
import { isNullOrUndefined } from 'util';


const emptyCancellationToken: ts.CancellationToken = {
    isCancellationRequested: () => false,
    throwIfCancellationRequested: () => { }
};

const transformers: ts.CustomTransformers = {
    before: [metadataTransformer],
    after: []
};

const emitOnlyDtsFiles = false;
const targetSourceFile: ts.SourceFile = undefined;
const writeFile: ts.WriteFileCallback = undefined;

const toAbsolute = (location: string, rootPath: string): string => {
    if(isNullOrUndefined(location)) {
        return null;
    }
    if(isNullOrUndefined(rootPath)) {
        return location;
    }
    return path.join(rootPath, location);
}

export const build = (pattern: string, outDir: string, outFile: string, rootDir: string): ts.Program => {
    const options: ts.CompilerOptions = {
        rootDir: rootDir,
        outDir: toAbsolute(outDir, rootDir),
        outFile: toAbsolute(outFile, rootDir),

        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ES5
    };

    const compilerHost = ts.createCompilerHost(options);

    const files = glob.sync(pattern,  { root: rootDir });
    Logger.log("Found files to transpile:")
    Logger.log(files);

    return ts.createProgram(files, options, compilerHost);    
};

export const emit = (program: ts.Program): ts.EmitResult => {
    return program.emit(targetSourceFile, writeFile, emptyCancellationToken, emitOnlyDtsFiles, transformers);
}
