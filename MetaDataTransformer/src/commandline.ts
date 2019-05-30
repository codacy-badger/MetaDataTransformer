import { CommandLineParser, CommandLineFlagParameter, CommandLineStringParameter, CommandLineAction, CommandLineChoiceParameter } from '@microsoft/ts-command-line';
import * as ts from 'typescript';

import { build, emit } from "./transpiler";
import { Logger } from './logger';

export class CommandLine extends CommandLineParser {
    private _verbose: CommandLineFlagParameter; 
   
    public constructor() {
        super({
            toolFilename: 'tsca',
            toolDescription: 'Typescript transpiler with reflection capabilities.'
        });

        this.addAction(new BuildAction());
    }
   
    protected onDefineParameters(): void {
        this._verbose = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Show extra logging detail'
        });
    }
   
    protected onExecute(): Promise<void> {
        Logger.isEnabled = this._verbose.value;

        return super.onExecute();
    }
}

class BuildAction extends CommandLineAction {
    private _pattern: CommandLineStringParameter;
    private _outDir: CommandLineStringParameter;
    private _outFile: CommandLineStringParameter;
    private _rootDir: CommandLineStringParameter;
    private _module: CommandLineChoiceParameter;
    private _moduleResolution: CommandLineChoiceParameter;
    private _target: CommandLineChoiceParameter;
    private _sourceMap: CommandLineFlagParameter;
    private _sourceRoot: CommandLineStringParameter;
    private _mapRoot: CommandLineStringParameter;

    public constructor() {
      super({
        actionName: 'build',
        summary: 'Transpiles the given typescript files',
        documentation: 'Transpiles the given typescript files'
      });
    }
   
    protected onExecute(): Promise<void> {
        Logger.log(`Pattern: '${this._pattern.value}'`);
        Logger.log(`RootDir: '${this._rootDir.value}'`);
        Logger.log(`OutDir: '${this._outDir.value}'`);
        Logger.log(`OutFile: '${this._outFile.value}'`);
        Logger.log(`Module: '${this._module.value}'`);
        Logger.log(`ModuleResolution: '${this._moduleResolution.value}'`);
        Logger.log(`Target: '${this._target.value}'`);
        Logger.log(`SourceMap: '${this._sourceMap.value}'`);
        Logger.log(`SourceRoot: ${this._sourceRoot.value}`)
        Logger.log(`MapRoot: ${this._mapRoot.value}`);

        const program = build(
            this._pattern.value, 
            this._outDir.value, 
            this._outFile.value, 
            this._rootDir.value, 
            this._module.value, 
            this._moduleResolution.value,
            this._target.value,
            this._sourceMap.value,
            this._sourceRoot.value,
            this._mapRoot.value);
        const result = emit(program);

        if(result.emitSkipped) {
            Logger.log('Emit has been skiped');
        } else {
            Logger.log('Emited files:')
            Logger.log(result.emittedFiles);
        }

        result.diagnostics.forEach(diagnostic => {
            switch(diagnostic.category) {
                case ts.DiagnosticCategory.Error:
                    console.error(diagnostic.messageText);
                    break;
                    case ts.DiagnosticCategory.Warning:
                        console.warn(diagnostic.messageText);
                        break;
                    default:
                        console.log(diagnostic.messageText);
                        break;
            }
        });

        return Promise.resolve();
    }
   
    protected onDefineParameters(): void {     
        this._pattern = this.defineStringParameter({
            argumentName: "PATTERN",
            parameterLongName: '--pattern',
            description: 'The pattern which is used to locate the files to transpile',
            required: true
        });
        this._outDir = this.defineStringParameter({
            argumentName: "OUTDIR",
            parameterLongName: '--out-dir',
            description: 'The output directory',
            required: false
        });
        this._outFile = this.defineStringParameter({
            argumentName: "OUTFILE",
            parameterLongName: '--out-file',
            description: 'The output file',
            required: false
        });
        this._rootDir = this.defineStringParameter({
            argumentName: "ROOTDIR",
            parameterLongName: '--root-dir',
            description: 'The root directory',
            required: false
        });
        this._module = this.defineChoiceParameter({
            required: false,
            defaultValue: 'None',
            parameterLongName: '--module',
            description: 'The module',
            alternatives: [ 'None', 'CommonJS', 'AMD', 'UMD', 'System', 'ES2015', 'ESNext' ]
        });
        this._moduleResolution = this.defineChoiceParameter({
            required: false,
            defaultValue: 'Classic',
            parameterLongName: '--module-resolution',
            description: 'The module',
            alternatives: [ 'Classic', 'NodeJs' ]
        });
        this._target = this.defineChoiceParameter({
            required: false,
            defaultValue: 'ES5',
            parameterLongName: '--target',
            description: 'The target',
            alternatives: [ 'ES3', 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ESNext', 'JSON', 'Latest' ]
        });
        this._sourceMap = this.defineFlagParameter({
            parameterLongName: '--source-map',
            description: 'Should create source maps',
            required: false
        });
        this._sourceRoot = this.defineStringParameter({ 
            argumentName: "SOURCEROOT",
            parameterLongName: '--source-root',
            description: 'The source root',
            required: false
        });
        this._mapRoot = this.defineStringParameter({ 
            argumentName: "MAPROOT",
            parameterLongName: '--map-root',
            description: 'The map root',
            required: false
        });
    }
}