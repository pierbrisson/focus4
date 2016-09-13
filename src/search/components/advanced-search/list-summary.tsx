import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../../../defaults";

import {SearchStore} from "../../store";

export interface Props {
    exportAction?: () => void;
    scopes: {code: string, label: string}[];
    scopeLock: boolean;
    store: SearchStore;
}

@autobind
@observer
export class ListSummary extends React.Component<Props, {}> {
    static defaultProps = {
        totalCount: 0,
        query: ""
    };

    private onScopeClick() {
        this.props.store.setProperties({
            scope: "ALL",
            selectedFacets: {},
            groupingKey: undefined
        });
    }

    private get scopeLabel() {
        const {store, scopes} = this.props;
        const selectedScope = scopes.find(sc => sc.code === store.scope);
        return selectedScope && selectedScope.label || store.scope;
}

    private get resultSentence() {
        const {totalCount, query} = this.props.store;
        const hasText = query && query.trim().length > 0;
        return (
            <span>
                <strong>{totalCount}&nbsp;</strong>
                {`résultat${totalCount > 1 ? "s" : ""} ${hasText && `pour "${query}"`}`}
            </span>
        );
    }

    render() {
        const {TopicDisplayer, Button} = defaults;
        if (!TopicDisplayer || !Button) {
            throw new Error("Les composants Button ou TopicDisplayer n'ont pas été définis. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
        }

        const {store, exportAction} = this.props;
        const scope = store.scope && store.scope !== "ALL" ? {scope: {
            code: store.scope,
            label: "Scope",
            value: this.scopeLabel
        }} : undefined;

        return (
            <div data-focus="list-summary">
                {exportAction ?
                    <div className="print">
                        <Button handleOnClick={this.props.exportAction} icon="print" label="result.export" shape={null} />
                    </div>
                : null}
                <span className="sentence">{this.resultSentence}</span>
                <span className="topics">
                    <TopicDisplayer
                        topicClickAction={this.onScopeClick}
                        topicList={!this.props.scopeLock ? scope : undefined}
                    />
                </span>
            </div>
        );
    }
}