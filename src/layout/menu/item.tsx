import {action, observable} from "mobx";
import {useObserver} from "mobx-react-lite";
import * as React from "react";
import posed, {Transition} from "react-pose";
import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import {defaultPose} from "../../animation";
import {useTheme} from "../../theme";

import {MenuContext} from "./context";
import {MainMenuList} from "./list";

import * as styles from "./__style__/menu.css";

/** Props du MenuItem. */
export interface MainMenuItemProps extends ButtonProps {
    /** La route associée, pour comparaison avec la route active. */
    route?: string;
    /** CSS. */
    theme?: IconButtonTheme & {panel?: string};
}

/** Elément de menu. */
export function MainMenuItem({label, icon, onClick, route, children, theme: pTheme, ...otherProps}: MainMenuItemProps) {
    const theme = useTheme("mainMenu", styles, pTheme);
    const context = React.useContext(MenuContext);
    const [state] = React.useState(() => observable({hasSubMenu: false, top: 0, left: 0}));

    const li = React.useRef<HTMLLIElement>(null);
    const panel = React.useRef<HTMLDivElement>(null);

    const onItemClick = React.useCallback(
        action(() => {
            if (children) {
                const liRect = li.current!.getBoundingClientRect();
                state.hasSubMenu = !state.hasSubMenu;
                state.top = liRect.top;
                state.left = liRect.left + liRect.width;
            }
            if (onClick) {
                onClick();
                context.closePanel();
            }
        }),
        []
    );

    const onDocumentClick = React.useCallback((e: MouseEvent) => {
        if (panel.current && li.current) {
            if (!panel.current.contains(e.target as Node) && !li.current.contains(e.target as Node)) {
                state.hasSubMenu = false;
            }
        }
    }, []);

    React.useEffect(() => {
        document.addEventListener("mouseup", onDocumentClick);
        return () => document.removeEventListener("mouseup", onDocumentClick);
    }, []);

    return useObserver(() => (
        <>
            <li ref={li} className={`${theme.item} ${route === context.activeRoute ? theme.active : ""}`}>
                {label ? (
                    <Button {...otherProps} icon={icon} label={label} onClick={onItemClick} theme={theme} />
                ) : (
                    <IconButton {...otherProps} icon={icon} onClick={onItemClick} theme={theme} />
                )}
            </li>
            {context.renderSubMenu(
                <Transition>
                    {state.hasSubMenu && (
                        <PosedDiv key="panel" ref={panel} className={theme.panel} style={state}>
                            <MainMenuList
                                activeRoute={context.activeRoute}
                                closePanel={() => (state.hasSubMenu = false)}
                                theme={theme}
                            >
                                {children}
                            </MainMenuList>
                        </PosedDiv>
                    )}
                </Transition>
            )}
        </>
    ));
}

const PosedDiv = posed.div({
    enter: {
        width: "auto",
        opacity: 1,
        ...defaultPose
    },
    exit: {
        width: 0,
        opacity: 0.7,
        ...defaultPose
    }
});
