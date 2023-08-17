import { ComponentStateKind, PropValueKind, } from "../types";
import ComponentStateHelpers from "./ComponentStateHelpers";
import ExpressionHelpers from "./ExpressionHelpers";
import TypeGuards from "./TypeGuards";
import { TEMPLATE_STRING_EXPRESSION_REGEX } from "../constants";
/**
 * A static class for housing various util functions related to component state used by Studio.
 */
class ComponentTreeHelpers {
    /**
     * Performs an Array.prototype.map over the given {@link ComponentState}s in
     * a level order traversal, starting from the leaf nodes (deepest children)
     * and working up to root node.
     *
     * @param componentTree - the component tree to perform on
     * @param handler - a function to execute on each component
     * @param parent - the top-most parent or root node to work up to
     *
     * @returns an array of elements returned by the handler function
     */
    static mapComponentTree(componentTree, handler, parent) {
        const { directChildren, otherNodes } = ComponentTreeHelpers.separateDescendants(componentTree, parent);
        return directChildren.map((component) => {
            const children = this.mapComponentTree(otherNodes, handler, component);
            return handler(component, children);
        });
    }
    /**
     * Similar to mapComponentTree but guarantees that parent nodes are
     * called before leaf nodes.
     *
     * @param componentTree - the component tree to perform on
     * @param handler - a function to execute on each component
     *
     * @returns an array of elements returned by the handler function
     */
    static mapComponentTreeParentsFirst(componentTree, handler, parent, parentValue) {
        const { directChildren, otherNodes } = ComponentTreeHelpers.separateDescendants(componentTree, parent);
        return directChildren.flatMap((component) => {
            const mappedValue = handler(component, parentValue);
            return [
                mappedValue,
                ...ComponentTreeHelpers.mapComponentTreeParentsFirst(otherNodes, handler, component, mappedValue),
            ];
        });
    }
    static separateDescendants(componentTree, parent) {
        const directChildren = [];
        const otherNodes = [];
        componentTree.forEach((component) => {
            if (component.parentUUID === parent?.uuid) {
                directChildren.push(component);
            }
            else {
                otherNodes.push(component);
            }
        });
        return { directChildren, otherNodes };
    }
    /**
     * Checks whether the component tree uses a specific expression source, such
     * as `document` or `props`.
     */
    static usesExpressionSource(componentTree, source) {
        const expressions = this.getComponentTreeExpressions(componentTree);
        const sourceExpressions = this.selectExpressionsWithSource(expressions, source);
        return sourceExpressions.length > 0;
    }
    /**
     * Selects expressions containing the specified source from an array of
     * expressions, parsing expressions from template strings if necessary.
     */
    static selectExpressionsWithSource(expressions, source) {
        return expressions.flatMap((expression) => {
            if (TypeGuards.isTemplateString(expression)) {
                return [...expression.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)]
                    .map((m) => m[1])
                    .filter((m) => ExpressionHelpers.usesExpressionSource(m, source));
            }
            if (ExpressionHelpers.usesExpressionSource(expression, source))
                return [expression];
            return [];
        });
    }
    /**
     * Returns an array of the expressions used in the component tree.
     */
    static getComponentTreeExpressions(componentTree) {
        const expressions = componentTree.flatMap((c) => {
            if (!TypeGuards.isEditableComponentState(c) &&
                c.kind !== ComponentStateKind.Error) {
                return [];
            }
            const props = ComponentStateHelpers.extractRepeatedState(c).props;
            const expressionPropValues = this.getExpressionUsagesFromProps(props);
            return TypeGuards.isRepeaterState(c)
                ? [c.listExpression, ...expressionPropValues]
                : expressionPropValues;
        });
        return expressions;
    }
    static getExpressionUsagesFromProps(props) {
        return Object.values(props).flatMap(this.getExpressionUsagesFromPropVal);
    }
    static getExpressionUsagesFromPropVal = ({ kind, value, }) => {
        if (kind === PropValueKind.Expression) {
            return [value];
        }
        else if (typeof value === "object") {
            if (Array.isArray(value)) {
                return value.flatMap(this.getExpressionUsagesFromPropVal);
            }
            else {
                return this.getExpressionUsagesFromProps(value);
            }
        }
        else {
            return [];
        }
    };
    /**
     * Returns all descendants of the given ComponentState within the given tree.
     */
    static getDescendants(ancestorState, componentTree) {
        const descendants = ComponentTreeHelpers.mapComponentTree(componentTree, (componentState, mappedChildren) => [
            componentState,
            ...mappedChildren.flat(),
        ], ancestorState).flat();
        return descendants;
    }
}
export default ComponentTreeHelpers;
//# sourceMappingURL=ComponentTreeHelpers.js.map