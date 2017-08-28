import {autobind} from "core-decorators";
import i18next from "i18next";
import {reduce} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Motion, spring} from "react-motion";
import {Button, IconButton} from "react-toolbox/lib/button";
import {Input} from "react-toolbox/lib/input";

import {ButtonMenu, getIcon, MenuItem} from "../../components";
import {ContextualActions, GroupOperationListItem, ListStore, MiniListStore} from "../../list";
import {classReaction} from "../../util";

import {SearchStore} from "../store";
import {FacetBox, shouldDisplayFacet} from "./facet-box";

import * as styles from "./__style__/action-bar.css";

const MIN_FACETBOX_HEIGHT = 80;
const DEFAULT_FACETBOX_MARGIN = 1000;

export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps<T> {
    group?: {code: string, label: string, totalCount: number};
    hasFacetBox?: boolean;
    hasGrouping?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: GroupOperationListItem<T>[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    searchBarPlaceholder?: string;
    showSingleValuedFacets?: boolean;
    store: MiniListStore<T>;
    theme?: ActionBarStyle;
}

@observer
@autobind
export class ActionBar<T> extends React.Component<ActionBarProps<T>, void> {

    @observable displayFacetBox = false;
    @observable facetBoxHeight = DEFAULT_FACETBOX_MARGIN;

    protected facetBox?: HTMLDivElement;

    @computed
    protected get selectionButton() {
        const {hasSelection, i18nPrefix = "focus", store, theme} = this.props;
        if (hasSelection) {
            return (
                <IconButton
                    icon={getIcon(`${i18nPrefix}.icons.actionBar.${store.selectionStatus}`)}
                    onClick={store.toggleAll}
                    theme={{toggle: theme!.selectionToggle, icon: theme!.selectionIcon}}
                />
            );
        } else {
            return null;
        }
    }

    protected get filterButton() {
        const {theme, hasFacetBox, showSingleValuedFacets, i18nPrefix = "focus", store} = this.props;
        if (hasFacetBox && isSearch(store) && store.facets.some(facet => shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))) {
            return (
                <div style={{position: "relative"}}>
                    <Button
                        onClick={() => this.displayFacetBox = !this.displayFacetBox}
                        icon={getIcon(`${i18nPrefix}.icons.actionBar.drop${this.displayFacetBox ? "up" : "down"}`)}
                        theme={{icon: theme!.dropdown!}}
                        label={i18next.t(`${i18nPrefix}.search.action.filter`)}
                    />
                    {this.displayFacetBox ? <div className={theme!.triangle!} /> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    @computed
    protected get sortButton() {
        const {i18nPrefix = "focus", orderableColumnList, store, theme} = this.props;

        if (store.totalCount > 1 && !store.selectedItems.size && (isSearch(store) || isList(store)) && orderableColumnList) {
            return (
                <ButtonMenu
                    button={{
                        label: i18next.t(`${i18nPrefix}.search.action.sort`),
                        icon: getIcon(`${i18nPrefix}.icons.actionBar.dropdown`),
                        openedIcon: getIcon(`${i18nPrefix}.icons.actionBar.dropup`),
                        theme: {icon: theme!.dropdown!}
                    }}
                    onClick={() => this.displayFacetBox = false}
                >
                    {orderableColumnList.map(description => (
                        <MenuItem
                            onClick={action(() => {
                                store.sortBy = description.key;
                                store.sortAsc = description.order;
                            })}
                            caption={description.label}
                        />
                    ))}
                </ButtonMenu>
            );
        }

        return null;
    }

    @computed
    protected get groupButton() {
        const {hasGrouping, i18nPrefix = "focus", store, theme} = this.props;

        if (hasGrouping && isSearch(store) && !store.selectedItems.size && !store.groupingKey) {
            const groupableColumnList = store.facets && store.scope !== "ALL" ? store.facets.reduce((result, facet) => {
                if (facet.values.length > 1) {
                    result[facet.code] = facet.label;
                }
                return result;
            }, {} as {[facet: string]: string}) : {};

            const menuItems = reduce(groupableColumnList, (operationList, label, key) => [
                ...operationList,
                <MenuItem
                    onClick={() => store.groupingKey = key}
                    caption={i18next.t(label)}
                />
            ], []);

            if (menuItems.length) {
                return (
                    <ButtonMenu
                        button={{
                            label: i18next.t(`${i18nPrefix}.search.action.group`),
                            icon: getIcon(`${i18nPrefix}.icons.actionBar.dropdown`),
                            openedIcon: getIcon(`${i18nPrefix}.icons.actionBar.dropup`),
                            theme: {icon: theme!.dropdown!}
                        }}
                        onClick={() => this.displayFacetBox = false}
                    >
                        {menuItems}
                    </ButtonMenu>
                );
            }
        }

        return null;
    }

    @computed
    protected get searchBar() {
        const {theme, i18nPrefix = "focus", hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar && (isList(store) || isSearch(store))) {
            return (
                <div className={theme!.searchBar!}>
                    <Input
                        icon={getIcon(`${i18nPrefix}.icons.actionBar.search`)}
                        value={store.query}
                        onChange={(text: string) => store.query = text}
                        hint={searchBarPlaceholder}
                        theme={{input: theme!.searchBarField, icon: theme!.searchBarIcon, hint: theme!.searchBarHint}}
                    />
                    {store.query ?
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.actionBar.close`)}
                            onClick={() => store.query = ""}
                        />
                    : null}
                </div>
            );
        }

        return null;
    }

    @classReaction<ActionBar<T>>(that => () => {
        // tslint:disable-next-line:no-shadowed-variable
        const {hasFacetBox, store} = that.props;
        return hasFacetBox && isSearch(store) && store.facets.length && store.facets[0] || false;
    })
    protected closeFacetBox() {
        const {store, showSingleValuedFacets} = this.props;

        if (!this.displayFacetBox) {
            this.facetBoxHeight = DEFAULT_FACETBOX_MARGIN;
        }

        if (this.displayFacetBox && isSearch(store) && store.facets.every(facet => !shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))) {
            this.displayFacetBox = false;
        }
    }

    componentDidMount() {
        this.updateFacetBoxHeight();
    }

    componentDidUpdate() {
        this.updateFacetBoxHeight();
    }

    protected updateFacetBoxHeight() {
        if (this.facetBox && this.facetBox.clientHeight > MIN_FACETBOX_HEIGHT) {
            this.facetBoxHeight = this.facetBox.clientHeight;
        }
    }

    render() {
        const {theme, group, hasFacetBox, i18nPrefix = "focus", nbDefaultDataListFacet = 6, operationList, scopeFacetKey = "FCT_SCOPE", showSingleValuedFacets, store} = this.props;
        return (
            <div className={theme!.container!}>
                <div className={`${theme!.bar!} ${store.selectedItems.size ? theme!.selection! : ""}`}>
                    <div className={theme!.buttons!}>
                        {this.selectionButton}
                        {group ?
                            <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong>
                        : null}
                        {store.selectedItems.size ?
                            <strong>{`${store.selectedItems.size} ${i18next.t(`${i18nPrefix}.search.action.selectedItem${store.selectedItems.size > 1 ? "s" : ""}`)}`}</strong>
                        : null}
                        {this.filterButton}
                        {this.sortButton}
                        {this.groupButton}
                        {this.searchBar}
                    </div>
                    {store.selectedItems.size && operationList && operationList.length ?
                        <ContextualActions operationList={operationList} operationParam={Array.from(store.selectedItems)} />
                    : null}
                </div>
                {hasFacetBox && isSearch(store) ?
                    <div className={theme!.facetBoxContainer}>
                        <Motion style={{marginTop: this.facetBoxHeight === DEFAULT_FACETBOX_MARGIN ? -this.facetBoxHeight : spring(this.displayFacetBox ? 5 : -this.facetBoxHeight)}}>
                            {(style: {marginTop: number}) => (
                                <div style={style} ref={i => this.facetBox = i}>
                                    <IconButton
                                        icon={getIcon(`${i18nPrefix}.icons.actionBar.close`)}
                                        onClick={() => this.displayFacetBox = false}
                                    />
                                    <FacetBox
                                        theme={{facetBox: theme!.facetBox!}}
                                        nbDefaultDataList={nbDefaultDataListFacet}
                                        scopeFacetKey={scopeFacetKey}
                                        showSingleValuedFacets={showSingleValuedFacets}
                                        store={store}
                                    />
                                </div>
                            )}
                        </Motion>
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("actionBar", styles)(ActionBar);

function isSearch(store: any): store is SearchStore {
    return store.hasOwnProperty("groupingKey");
}

function isList(store: any): store is ListStore<any> {
    return store.hasOwnProperty("innerDataList");
}
