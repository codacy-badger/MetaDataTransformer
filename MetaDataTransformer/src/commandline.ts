import { CommandLineParser, CommandLineFlagParameter, CommandLineStringParameter, CommandLineAction } from '@microsoft/ts-command-line';
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

        const program = build(this._pattern.value, this._outDir.value, this._outFile.value, this._rootDir.value);
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
    }
}