import { PropValueKind, PropValueType, } from "../types";
export default class MissingPropsChecker {
    static getMissingRequiredProps(propValues, propShape, path) {
        if (!propShape) {
            return [];
        }
        return Object.keys(propShape).flatMap((propName) => {
            const propVal = propValues[propName];
            const propMetadata = propShape[propName];
            const pathToPropName = path
                ? this.getExtendedFieldPath(path, propName)
                : propName;
            if (propVal === undefined) {
                if (propMetadata.required) {
                    return pathToPropName;
                }
                return [];
            }
            return this.getMissingFieldsFromProp(propVal, propMetadata, pathToPropName);
        });
    }
    static getMissingFieldsFromProp(propVal, propMetadata, path) {
        if (propVal.kind === PropValueKind.Expression) {
            return [];
        }
        if (propVal.valueType === PropValueType.Array &&
            propMetadata.type === PropValueType.Array) {
            const itemType = propMetadata.itemType;
            return propVal.value.flatMap((val, index) => {
                const pathWithArrayIndex = `${path}[${index}]`;
                return this.getMissingFieldsFromProp(val, itemType, pathWithArrayIndex);
            });
        }
        else if (propVal.valueType === PropValueType.Object &&
            propMetadata.type === PropValueType.Object) {
            return this.getMissingRequiredProps(propVal.value, propMetadata.shape, path);
        }
        return [];
    }
    static getExtendedFieldPath(currentPath, propName) {
        return `${currentPath}.${propName}`;
    }
}
//# sourceMappingURL=MissingPropsChecker.js.map