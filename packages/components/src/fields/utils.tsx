import {upperFirst} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {
    AutocompleteComponents,
    BaseSelectProps,
    EntityField,
    FieldEntry,
    FieldEntryType,
    InputComponents,
    ReferenceList,
    SelectComponents
} from "@focus4/stores";

import {AutocompleteResult} from "../autocomplete";

import {Field, FieldOptions} from "./field";

function getOnChange<F extends FieldEntry>(field: EntityField<F>) {
    return action(
        `on${upperFirst(field.$field.name)}Change`,
        (value: FieldEntryType<F> | undefined) => (field.value = value)
    );
}

/**
 * Crée un champ avec saisie en autocomplete
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function autocompleteFor<T extends FieldEntry>(
    field: EntityField<T>,
    options: Partial<FieldOptions<T>> &
        AutocompleteComponents<
            NonNullable<T["domain"]["autocompleteProps"]>,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > & {
            /** Service de résolution de code. */
            keyResolver?: (key: number | string) => Promise<string | undefined>;
            /** Service de recherche. */
            querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
        }
) {
    const {keyResolver, querySearcher, ...otherOptions} = options;
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...otherOptions}
            autocompleteProps={{...((options.autocompleteProps as {}) || {}), keyResolver, querySearcher}}
            inputType="autocomplete"
        />
    );
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T extends FieldEntry>(
    field: EntityField<T>,
    options: Partial<FieldOptions<T>> &
        InputComponents<
            NonNullable<T["domain"]["inputProps"]>,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > = {}
) {
    return <Field field={field} onChange={getOnChange(field)} {...options} inputType="input" />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T extends FieldEntry>(
    field: EntityField<T>,
    values: ReferenceList,
    options: Partial<FieldOptions<T>> &
        SelectComponents<
            NonNullable<T["domain"]["selectProps"]> & BaseSelectProps,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > = {}
) {
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...options}
            selectProps={{
                values: values.slice(),
                labelKey: values.$labelKey,
                valueKey: values.$valueKey,
                ...((options.selectProps as {}) || {})
            }}
            inputType="select"
        />
    );
}
