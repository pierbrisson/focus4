import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import * as React from "react";
import {themeable, themr} from "react-css-themr";
import {findDOMNode} from "react-dom";
import {Input} from "react-toolbox/lib/input";

import {Display} from "../../components";

import {BaseDisplayProps, BaseInputProps, BaseLabelProps, Domain, EntityField} from "../types";
import {documentHelper} from "./document-helper";

import * as styles from "./__style__/field.css";

export type FieldStyle = Partial<typeof styles>;

export type RefValues<T, ValueKey extends string, LabelKey extends string> = {[P in ValueKey]: T} & {[P in LabelKey]: string};

/** Options pour gérer une liste de référence. */
export interface ReferenceOptions<
    T,
    R extends RefValues<T, ValueKey, LabelKey>,
    ValueKey extends string,
    LabelKey extends string
> {
    /** Nom de la propriété de libellé. Doit être casté en lui-même (ex: `{labelKey: "label" as "label"}`). Par défaut: "label". */
    labelKey?: LabelKey;
    /** Nom de la propriété de valeur. Doit être casté en lui-même (ex: `{valueKey: "code" as "code"}`). Par défaut: "code". */
    valueKey?: ValueKey;
    /** Liste des valeurs de la liste de référence. Doit contenir les propriétés `valueKey` et `labelKey`. */
    values?: R[];
}

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<
    T,
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps,
    R extends RefValues<T, ValueKey, LabelKey>,
    ValueKey extends string,
    LabelKey extends string
> extends ReferenceOptions<T, R, ValueKey, LabelKey> {
    /** Désactive le style inline qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Surcharge l'erreur du field. */
    error?: string | null;
    /** Service de résolution de code. */
    keyResolver?: (key: number | string) => Promise<string>;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** A utiliser à la place de `ref`. */
    innerRef?: (i: Field<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>) => void;
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** Handler de modification de la valeur. */
    onChange?: ICProps["onChange"];
    /** CSS. */
    theme?: FieldStyle & {display?: DCProps["theme"], input?: ICProps["theme"]};
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@autobind
@observer
export class Field<
    T,
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps,
    R extends RefValues<T, ValueKey, LabelKey> ,
    ValueKey extends string,
    LabelKey extends string
> extends React.Component<FieldOptions<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey> & {field: EntityField<T, Domain<ICProps, DCProps, LCProps>>}, void> {

    // On récupère le forceErrorDisplay du form depuis le contexte.
    static contextTypes = {form: PropTypes.object};
    context: {form?: {forceErrorDisplay: boolean}};

    /** <div /> contenant le composant de valeur (input ou display). */
    @observable
    private valueElement?: Element;
    /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
    @observable
    private hideErrorOnInit = this.props.field.isEdit && !this.props.field.value;

    /** Détermine si on affiche l'erreur ou pas. En plus des surcharges du form et du field lui-même, l'erreur est masquée si le champ est en cours de saisie. */
    @computed
    get showError() {
        return (!this.hideErrorOnInit || this.context.form && this.context.form.forceErrorDisplay || false)
            && !documentHelper.isElementActive(this.valueElement);
    }

    // On enregistre le <div> de la valeur et on enregistre un eventListener désactiver le `hideErrorOnInit` au premier clic sur
    componentDidMount() {
        // Poser une ref pose des problèmes de stack overflow (pas vraiment clair pourquoi), donc on fait un truc moisi pour récupérer le noeud qu'on veut.
        const children = findDOMNode(this).children;
        this.valueElement = children.item(children.length - 1);
        if (this.hideErrorOnInit) {
            this.valueElement.addEventListener("mousedown", this.disableHideError);
        }
    }

    /** Désactive le masquage de l'erreur si le champ était en création avant le premier clic. */
    private disableHideError() {
        this.hideErrorOnInit = false;
        this.valueElement!.removeEventListener("mousedown", this.disableHideError);
    }

    /** Appelé lors d'un changement sur l'input. */
    onChange(value: any) {
        const {onChange, field: {$field: {domain}}} = this.props;
        if (onChange) {
            (onChange as any)(domain.unformatter && domain.unformatter(value) || value);
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {valueKey = "code", labelKey = "label", values, field, keyResolver, theme} = this.props;
        const {value, $field: {domain: {displayFormatter = (t: string) => i18next.t(t), DisplayComponent = Display, displayProps = {}}}} = field;
        return (
            <DisplayComponent
                {...displayProps as {}}
                formatter={displayFormatter}
                keyResolver={keyResolver}
                labelKey={labelKey}
                theme={themeable(displayProps.theme || {} as any, theme!.display as any)}
                value={value as any}
                valueKey={valueKey}
                values={values}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {field, valueKey = "code", labelKey = "label", values, keyResolver, theme} = this.props;
        const {value, error, $field: {name, domain: {InputComponent = Input, inputFormatter = ((x: string) => x), inputProps = {}}}} = field;
        let props: any = {
            ...inputProps as {},
            value: inputFormatter(value),
            error: this.showError && error || undefined,
            name,
            onChange: this.onChange,
            theme: themeable(inputProps.theme || {} as any, theme!.input as any)
        };

        if (values) {
            props = {...props, values, labelKey, valueKey};
        }

        if (keyResolver) {
            props = {...props, keyResolver};
        }

        return <InputComponent {...props} />;
    }

    /** Affiche le composant de libellé (`LabelComponent`). */
    label() {
        const {name, label, domain: {LabelComponent = (() => <label htmlFor={name}>{label && i18next.t(label) || ""}</label>) as any}} = this.props.field.$field;
        return <LabelComponent name={name} text={label} />;
    }

    render() {
        const {disableInlineSizing, hasLabel = true, labelRatio = 33, field, theme} = this.props;
        const {valueRatio = 100 - (hasLabel ? labelRatio : 0)} = this.props;
        const {isEdit, error, $field: {isRequired, domain: {className = ""}}} = field;
        return (
            <div className={`${theme!.field} ${isEdit ? theme!.edit : ""} ${isEdit && error && this.showError ? theme!.invalid : ""} ${isRequired ? theme!.required : ""} ${className}`}>
                {hasLabel ?
                    <div style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}} className={theme!.label}>
                        {this.label()}
                    </div>
                : null}
                <div style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}} className ={`${theme!.value} ${className}`}>
                    {isEdit ? this.input() : this.display()}
                </div>
            </div>
        );
    }
}

export default themr("field", styles)(Field);
