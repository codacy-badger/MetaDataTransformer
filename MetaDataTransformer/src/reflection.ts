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
    isType: (type: Function): boolean => {
        const fnc = (type as any).getDeclartion;
        return !isNullOrUndefined(fnc) && typeof fnc === 'function';
    },
    getTypeDeclaration: (type: Function): IClassDeclaration => {
        if(reflection.isType(type)) {
            const fnc = (type as any).getDeclartion;
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