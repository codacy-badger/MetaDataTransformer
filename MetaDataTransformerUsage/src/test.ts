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

if(reflection.isType(Test)) {
    console.log(reflection.getTypeDeclaration(Test));
    console.log(reflection.isObjectValid({ id: 12, friendlyName: 'test' }, Test));
    console.log(reflection.isObjectValid({ id: 12 }, Test));
    console.log(reflection.isObjectValid({ friendlyName: 'test' }, Test));
    console.log(reflection.isObjectValid({ id: 12, friendlyName: 'test', description: 'This is a test object' }, Test));
}
