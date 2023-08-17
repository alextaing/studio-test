export type PropValues = {
    [propName: string]: PropVal;
};
export type PropVal = LiteralProp | ExpressionProp;
export type TypelessPropVal = {
    kind: PropValueKind.Literal;
    value: string | number | boolean | Record<string, TypelessPropVal> | TypelessPropVal[];
} | Omit<ExpressionProp, "valueType">;
export type LiteralProp<T = PropValues> = {
    kind: PropValueKind.Literal;
} & (NumberProp | StringProp | BooleanProp | HexColorProp | ObjectProp<T> | ArrayProp);
export type ExpressionProp = {
    kind: PropValueKind.Expression;
    valueType: Exclude<PropValueType, PropValueType.Object>;
    value: string;
} | RecordProp;
export declare enum PropValueType {
    number = "number",
    string = "string",
    boolean = "boolean",
    ReactNode = "ReactNode",
    Object = "Object",
    HexColor = "HexColor",
    Record = "Record",
    Array = "Array"
}
export declare enum PropValueKind {
    Literal = "Literal",
    Expression = "Expression"
}
type NumberProp = {
    valueType: PropValueType.number;
    value: number;
};
type StringProp = {
    valueType: PropValueType.string;
    value: string;
};
type BooleanProp = {
    valueType: PropValueType.boolean;
    value: boolean;
};
export type ObjectProp<T = PropValues> = {
    kind: PropValueKind.Literal;
    valueType: PropValueType.Object;
    value: T;
};
export type ArrayProp = {
    kind: PropValueKind.Literal;
    valueType: PropValueType.Array;
    value: PropVal[];
};
export type RecordProp = {
    kind: PropValueKind.Expression;
    valueType: PropValueType.Record;
    value: "document";
};
export type HexColor = `#${string}`;
type HexColorProp = {
    valueType: PropValueType.HexColor;
    value: HexColor;
};
export {};
//# sourceMappingURL=PropValues.d.ts.map