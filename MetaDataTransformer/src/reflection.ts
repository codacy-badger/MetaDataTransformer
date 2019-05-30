import { isNullOrUndefined } from "util";

export enum AccessModifier {
    Public,
    Protected,
    Private
}

export interface IClassDeclaration {
    properties: { [id: string] : IPropertyDeclaration }
}

export interface IPropertyDeclaration {
    isOptional: boolean;
    isStatic: boolean;
    accessModifier: AccessModifier;
}

export const reflection = {
    getTypeDeclaration: (type: Function): IClassDeclaration => {
        // getDeclartion should not be declared on every Function as not every function is a type
        // users must know by themself if the given function is a valid argument for this method
        const fnc = (type as any).getDeclartion;
        if(!isNullOrUndefined(fnc) && typeof fnc === 'function') {
            return fnc();
        }
        throw 'The given object seems to be no type.';
    },
    isObjectValid: (obj: any, type: Function): boolean => {
        const declartion = reflection.getTypeDeclaration(type);
        
        for(let propertyName in declartion.properties) {
            const property = declartion.properties[propertyName];
            if(!property.isOptional && !Object.keys(obj).some(key => key === propertyName)) {
                return false;
            }
        }
    
        return true;    
    }
};