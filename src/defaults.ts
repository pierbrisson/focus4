import {ComponentClass, SFC} from "react";

export type ReactComponent<P> = ComponentClass<P> | SFC<P>;

export let Field: ReactComponent<any> | undefined;
export let InputText: ReactComponent<any> | undefined;
export let Button: ReactComponent<any> | undefined;
export let Icon: ReactComponent<any> | undefined;
export let Dropdown: ReactComponent<any> | undefined;
export let ContextualActions: ReactComponent<any> | undefined;
export let Scope: ReactComponent<any> | undefined;
export let Checkbox: ReactComponent<any> | undefined;
export let ActionBar: ReactComponent<any> | undefined;
export let TopicDisplayer: ReactComponent<any> | undefined;
export let ButtonBackToTop: ReactComponent<any> | undefined;

/** Interface de tous les composants à définir. */
export interface Defaults {
    Field?: ReactComponent<any>;
    InputText?: ReactComponent<any>;
    Button?: ReactComponent<any>;
    Icon?: ReactComponent<any>;
    ContextualActions?: ReactComponent<any>;
    Dropdown?: ReactComponent<any>;
    Scope?: ReactComponent<any>;
    Checkbox?: ReactComponent<any>;
    ActionBar?: ReactComponent<any>;
    TopicDisplayer?: ReactComponent<any>;
    ButtonBackToTop?: ReactComponent<any>;
}

/**
 * Définit les composants par défauts pour utilisation dans les composants d'autofocus.
 * @param c L'objet contenant les composants.
 */
export function setDefaultComponents(c: Defaults) {
    Field = c.Field;
    InputText = c.InputText;
    Button = c.Button;
    Icon = c.Icon;
    Dropdown = c.Dropdown;
    ContextualActions = c.ContextualActions;
    Scope = c.Scope;
    Checkbox = c.Checkbox;
    ActionBar = c.ActionBar;
    TopicDisplayer = c.TopicDisplayer;
    ButtonBackToTop = c.ButtonBackToTop;
}