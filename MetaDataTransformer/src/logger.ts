export class Logger {
    public static isEnabled: boolean = false;

    public static log(obj: any): void {
        if(Logger.isEnabled) {
            console.log(obj);
        }
    }
}