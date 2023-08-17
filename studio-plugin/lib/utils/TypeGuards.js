import { SyntaxKind, } from "ts-morph";
import { ComponentStateKind, FileMetadataKind, PropValueKind, PropValueType, } from "../types";
import StaticParsingHelpers from "../parsers/helpers/StaticParsingHelpers";
/**
 * A static class for housing various typeguards used by Studio.
 */
class TypeGuards {
    static assertIsValidPropVal(propVal) {
        if (!this.isValidPropVal(propVal)) {
            throw new Error("Invalid prop value: " + JSON.stringify(propVal, null, 2));
        }
    }
    static isValidPropVal = (propVal) => {
        const { kind, valueType, value } = propVal;
        if (kind === PropValueKind.Expression) {
            return this.valueMatchesPropType({ type: PropValueType.string }, value);
        }
        switch (valueType) {
            case PropValueType.string:
            case PropValueType.boolean:
            case PropValueType.number:
            case PropValueType.HexColor:
                return this.valueMatchesPropType({ type: valueType }, value);
            case PropValueType.Array:
                return Array.isArray(value) && value.every(this.isValidPropVal);
            case PropValueType.Object:
                const baseIsValid = typeof value === "object" && !Array.isArray(value) && value !== null;
                return (baseIsValid &&
                    Object.values(value).every(this.isValidPropVal));
        }
        return false;
    };
    /** Checks that the value of a prop matches the prop type. */
    static valueMatchesPropType = (propType, value) => {
        switch (propType.type) {
            case PropValueType.string:
                const unionValues = propType.unionValues;
                const isStringUnion = !!unionValues;
                return (typeof value === "string" &&
                    (!isStringUnion || unionValues.includes(value)));
            case PropValueType.boolean:
                return typeof value === "boolean";
            case PropValueType.number:
                return typeof value === "number";
            case PropValueType.HexColor:
                return typeof value === "string" && value.startsWith("#");
            case PropValueType.Array:
                return (Array.isArray(value) &&
                    value.every((val) => this.valueMatchesPropType(propType.itemType, val)));
            case PropValueType.Object:
                const baseIsValid = typeof value === "object" && !Array.isArray(value) && value !== null;
                return (baseIsValid &&
                    Object.entries(propType.shape).every(([field, metadata]) => value[field] !== undefined
                        ? this.valueMatchesPropType(metadata, value[field])
                        : !metadata.required));
        }
        return false;
    };
    static isPrimitiveProp(propValueType) {
        return [
            PropValueType.boolean,
            PropValueType.string,
            PropValueType.number,
        ].includes(propValueType);
    }
    static isPropValueType(type) {
        const propTypes = Object.values(PropValueType);
        return propTypes.includes(type);
    }
    static isTemplateString(value) {
        return (typeof value == "string" &&
            value.startsWith("`") &&
            value.endsWith("`") &&
            value.length >= 2);
    }
    static isStreamsDataExpression(value) {
        return typeof value === "string" && value.startsWith("document.");
    }
    static isSiteSettingsExpression(value) {
        return typeof value === "string" && value.startsWith("siteSettings.");
    }
    static isNotFragmentElement(element) {
        if (element.isKind(SyntaxKind.JsxFragment)) {
            return false;
        }
        if (element.isKind(SyntaxKind.JsxSelfClosingElement)) {
            return true;
        }
        const name = StaticParsingHelpers.parseJsxElementName(element);
        return !["Fragment", "React.Fragment"].includes(name);
    }
    static isModuleMetadata(metadata) {
        return metadata?.kind === FileMetadataKind.Module;
    }
    static isModuleState(componentState) {
        return componentState.kind === ComponentStateKind.Module;
    }
    static isStandardOrModuleComponentState(componentState) {
        return (componentState.kind === ComponentStateKind.Module ||
            componentState.kind === ComponentStateKind.Standard);
    }
    static isRepeaterState(componentState) {
        return componentState.kind === ComponentStateKind.Repeater;
    }
    static isEditableComponentState(componentState) {
        return (componentState.kind === ComponentStateKind.Module ||
            componentState.kind === ComponentStateKind.Standard ||
            componentState.kind === ComponentStateKind.Repeater);
    }
    static isSiteSettingsValues(propValues) {
        for (const val of Object.values(propValues)) {
            if (val.kind === PropValueKind.Expression) {
                return false;
            }
            const isInvalidObject = val.valueType === PropValueType.Object &&
                !TypeGuards.isSiteSettingsValues(val.value);
            if (isInvalidObject) {
                return false;
            }
        }
        return true;
    }
    static isSiteSettingsShape(propShape) {
        return Object.values(propShape).every((metadata) => metadata.type !== PropValueType.ReactNode);
    }
    static canAcceptChildren(state, metadata) {
        return ((metadata && "acceptsChildren" in metadata && metadata.acceptsChildren) ||
            state?.kind === ComponentStateKind.Fragment ||
            state?.kind === ComponentStateKind.BuiltIn);
    }
}
export default TypeGuards;
//# sourceMappingURL=TypeGuards.js.map