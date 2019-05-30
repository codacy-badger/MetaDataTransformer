import { reflection } from 'metadatatransformer';

interface ITest {
    id: number;
    description?: string;
    friendlyName: string;
}

class Test implements ITest {
    public id: number;
    description?: string;
    friendlyName!: string;

    private field: boolean;

    public static nr: number;
    protected inner: string;

    protected static value: number;
}

console.log(reflection.getTypeDeclaration(Test));
console.log(reflection.isObjectValid({ id: 12, friendlyName: 'test' }, Test));
console.log(reflection.isObjectValid({ id: 12 }, Test));
console.log(reflection.isObjectValid({ friendlyName: 'test' }, Test));
console.log(reflection.isObjectValid({ id: 12, friendlyName: 'test', description: 'This is a test object' }, Test));

//TODO: generate this method on every type? or create reflection utility to create less code
/*const isValid = (obj: any, type: Function): boolean => {
    const declartion = (type as any).getDeclartion();
    
    for(let propertyName in declartion.properties) {
        const property = declartion.properties[propertyName];
        if(property.isRequired && !Object.keys(obj).some(key => key === propertyName)) {
            return false;
        }
    }

    return true;
};

isValid(test, Test);*/

//TODO: interfaces must work to!
//isValid(test, ITest);