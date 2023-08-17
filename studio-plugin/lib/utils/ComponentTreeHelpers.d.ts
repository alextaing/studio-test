import { ComponentState, TypelessPropVal } from "../types";
/**
 * A static class for housing various util functions related to component state used by Studio.
 */
export default class ComponentTreeHelpers {
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
    static mapComponentTree<T>(componentTree: ComponentState[], handler: (component: ComponentState, mappedChildren: T[]) => T, parent?: ComponentState): T[];
    /**
     * Similar to mapComponentTree but guarantees that parent nodes are
     * called before leaf nodes.
     *
     * @param componentTree - the component tree to perform on
     * @param handler - a function to execute on each component
     *
     * @returns an array of elements returned by the handler function
     */
    static mapComponentTreeParentsFirst<T>(componentTree: ComponentState[], handler: (component: ComponentState, parentValue?: T) => T, parent?: ComponentState, parentValue?: T): T[];
    private static separateDescendants;
    /**
     * Checks whether the component tree uses a specific expression source, such
     * as `document` or `props`.
     */
    static usesExpressionSource(componentTree: ComponentState[], source: string): boolean;
    /**
     * Selects expressions containing the specified source from an array of
     * expressions, parsing expressions from template strings if necessary.
     */
    static selectExpressionsWithSource(expressions: string[], source: string): string[];
    /**
     * Returns an array of the expressions used in the component tree.
     */
    static getComponentTreeExpressions(componentTree: ComponentState[]): string[];
    private static getExpressionUsagesFromProps;
    static getExpressionUsagesFromPropVal: ({ kind, value, }: TypelessPropVal) => string[];
    /**
     * Returns all descendants of the given ComponentState within the given tree.
     */
    static getDescendants(ancestorState: ComponentState, componentTree: ComponentState[]): ComponentState[];
}
//# sourceMappingURL=ComponentTreeHelpers.d.ts.map