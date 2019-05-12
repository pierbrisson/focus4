import * as React from "react";

import {useTheme} from "@focus4/styling";

import * as styles from "./__style__/form.css";
export type FormStyle = Partial<typeof styles>;

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: React.ReactNode;
    /** Voir `FormActions` */
    formContext: {forceErrorDisplay: boolean};
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    save: () => void;
    /** CSS. */
    theme?: FormStyle;
}

export const FormContext = React.createContext({forceErrorDisplay: false});

/** Composant de formulaire */
export function Form(props: FormProps) {
    const theme = useTheme("form", styles, props.theme);
    return (
        <FormContext.Provider value={props.formContext}>
            {props.noForm ? (
                <form
                    className={theme.form}
                    noValidate={true}
                    onSubmit={e => {
                        e.preventDefault();
                        props.save();
                    }}
                >
                    <fieldset>{props.children}</fieldset>
                </form>
            ) : (
                props.children
            )}
        </FormContext.Provider>
    );
}
