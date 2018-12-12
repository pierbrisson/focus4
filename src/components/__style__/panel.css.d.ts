export interface PanelStyle {
    _: string;
    "_--busy": string;
    "_--edit": string;
    title: string;
    "title--top": string;
    "title--bottom": string;
    progress: string;
    actions: string;
    content: string;
}

export interface PanelStyleModifiers {
    (modifiers?: {busy?: boolean; edit?: boolean}): string;
    title(modifiers?: {top?: boolean; bottom?: boolean}): string;
    progress(): string;
    actions(): string;
    content(): string;
}

const styles: PanelStyle;
export default styles;
