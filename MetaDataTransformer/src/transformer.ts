import * as ts from 'typescript';
import { isNullOrUndefined } from 'util';

import { AccessModifier } from './reflection';

//TODO: interfaces and union types? partial types?
//TODO: method decleartions? constructor declarations? further stuff?
//TODO: why can property declearation name be null or empty?

//TODO: flatten tsc output
//TODO: npm install should not add it 's binaries to the top level folder but into node_modules/bin? because of --prefix
//TODO: correct build output (Emited files:, )

interface PropertyDeclaration {
    name: string;
    isOptional: boolean;
    isStatic: boolean;
    accessModifier: AccessModifier;
}
interface MethodDeclaration {

}
interface ConstructorDeclarations {

}

export const metadataTransformer = <T extends ts.Node>(context: ts.TransformationContext): ts.Transformer<T> => {

    const getAccessModifier = (nodes: ts.Node[]): AccessModifier => {
        if(nodes.some(n => n.kind === ts.SyntaxKind.PublicKeyword)) {
            return AccessModifier.Public;
        }        
        if(nodes.some(n => n.kind === ts.SyntaxKind.ProtectedKeyword)) {
            return AccessModifier.Protected;
        };
        if(nodes.some(n => n.kind === ts.SyntaxKind.PrivateKeyword)) {
            return AccessModifier.Private;
        }
        return AccessModifier.Public;
    };

    const isStatic = (nodes: ts.Node[]): boolean => {
        return nodes.some(n => n.kind === ts.SyntaxKind.StaticKeyword);
    };

    const flattenChildren = (node: ts.Node): ts.Node[] => {
        return [ node, ...[].concat(...node.getChildren().map(flattenChildren))];
    };

    const createMethodDeclarations = (declaration: ts.ClassDeclaration): MethodDeclaration[] => [];
    const createConstructorDeclarations = (declaration: ts.ClassDeclaration): ConstructorDeclarations[] => [];
    const createPropertyDeclarations = (declaration: ts.ClassDeclaration): PropertyDeclaration[] => {
        return declaration.members
            .filter(member => ts.isPropertyDeclaration(member))
            .filter(member => !isNullOrUndefined(member.name))
            .map(member => member as ts.PropertyDeclaration)
            .map(member => {
                const children = flattenChildren(member);

                return {
                    name: member.name.getText(),
                    isOptional: !isNullOrUndefined(member.questionToken),
                    accessModifier: getAccessModifier(children),
                    isStatic: isStatic(children)
                } as PropertyDeclaration;
            });
    };

    const createDeclarations = (declaration: ts.ClassDeclaration): ts.ObjectLiteralExpression => {
        const propertyDeclarations = createPropertyDeclarations(declaration);
        const properties = propertyDeclarations.map(dec => ts.createPropertyAssignment(dec.name, ts.createObjectLiteral([
            ts.createPropertyAssignment("isOptional", ts.createLiteral(dec.isOptional)),
            ts.createPropertyAssignment("isStatic", ts.createLiteral(dec.isStatic)),
            ts.createPropertyAssignment("accessModifier", ts.createLiteral(dec.accessModifier))
        ])));

        const methodDeclarations = createMethodDeclarations(declaration);
        const constructorDeclarations = createConstructorDeclarations(declaration);

        return ts.createObjectLiteral([
            ts.createPropertyAssignment('properties', ts.createObjectLiteral(properties)),
            ts.createPropertyAssignment('methods', ts.createObjectLiteral()),
            ts.createPropertyAssignment('constructors', ts.createObjectLiteral())
        ]);
    };

    const createDeclartionMethod = (declaration: ts.ClassDeclaration): ts.MethodDeclaration => {
        const type = ts.createTypeReferenceNode(declaration.name, []);
        const modifiers = [ ts.createModifier(ts.SyntaxKind.StaticKeyword), ts.createModifier(ts.SyntaxKind.PublicKeyword) ];
        const returnObject = createDeclarations(declaration);

        return ts.createMethod(
            /*decoraters*/ [],
            /*modifiers*/ modifiers,
            /*asteriskToken*/ null,
            /*name*/ ts.createIdentifier("getDeclartion"),
            /*questionToken*/ null,
            /*typeParameters*/ [],
            /*parameters*/ [],
            /*type*/ type,
            /*block*/ ts.createBlock([ ts.createReturn(returnObject) ])
        );
    };

    const decorateType = (declaration: ts.ClassDeclaration): ts.ClassDeclaration => {
        const declarationMethod = createDeclartionMethod(declaration);
        const members = [ ...declaration.members, declarationMethod ]
        
        return ts.updateClassDeclaration(
            /*classDecleration*/ declaration, 
            /*decorators*/ declaration.decorators, 
            /*modifiers*/ declaration.modifiers, 
            /*name*/ declaration.name,
            /*typeParameters*/ declaration.typeParameters, 
            /*heritageClauses*/ declaration.heritageClauses, 
            /*members*/ members);
    };

    const recursiveVisitor = (node: ts.Node): ts.Node => {
        if(node && node.kind === ts.SyntaxKind.ClassDeclaration) {
            return decorateType(node as ts.ClassDeclaration);
        }

        return ts.visitEachChild(node, recursiveVisitor, context);
    };

    return (node: T): T => {
        return ts.visitEachChild(node, recursiveVisitor, context);
    };
};
