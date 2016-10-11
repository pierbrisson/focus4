import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../../defaults";
import {translate} from "../../translation";

import {LineProps, OperationListItem} from "./lines";
import {ListBase, ListBaseProps} from "./list-base";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

export interface ListTableProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    columns: {sort?: "asc" | "desc", label: string, noSort: boolean}[];
    /** Default: 'id' */
    idField?: string;
    isEdit?: boolean;
    /** Default: false */
    isLoading?: boolean;
    loader?: () => React.ReactElement<any>;
    /** Default: [] */
    operationList?: OperationListItem[];
    /** Default: false */
    isSelectable?: boolean;
    sortColumn?: (index: number, order: "asc" | "desc") => void;
}

@autobind
export class ListTable<T, P extends LineProps<T>> extends ListBase<T, ListTableProps<T, P>> {

    /** Instancie une version typée du ListTable. */
    static create<T, L extends LineProps<T>>(props: ListTableProps<T, L>) {
        const List = ListTable as any;
        return <List {...props} />;
    }

    private renderTableHeader() {
        const columns = this.props.columns.map((colProperties, id) => {
            let sort: React.ReactElement<any> | null;
            if (!this.props.isEdit && !colProperties.noSort) {
                const order = colProperties.sort ? colProperties.sort : "asc";
                const iconName = "asc" === order ? "arrow_drop_up" : "arrow_drop_down";
                const icon = <i className="material-icons">{iconName}</i>;
                sort = <a className="sort" data-bypass data-name={id} href="#" onClick={this.sortColumnAction(id, ("asc" === order ? "desc" : "asc" ))}>{icon}</a>;
            } else {
                sort = null;
            }
            return <th className={TABLE_CELL_CLASS} key={colProperties.label}>{translate(colProperties.label)}{sort}</th>;
        });
        return <thead><tr>{columns}</tr></thead>;
    }

    private sortColumnAction(index: number, order: "asc" | "desc") {
        return (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            if (this.props.sortColumn) {
                this.props.sortColumn(index, order);
            }
        };
    }

    private renderTableBody() {
        const {data, LineComponent, idField = "id", operationList, lineProps} = this.props;
        return (
            <tbody>
                {data.map((item, idx) => {
                    const idValue = (item as any)[idField];
                    return (
                        <LineComponent
                            data={item}
                            key={(idValue && (idValue.$entity ? idValue.value : idValue)) || idx}
                            operationList={operationList || []}
                            {...lineProps}
                        />
                    );
                })}
            </tbody>
        );
    }

    private renderLoading() {
        const {isLoading, loader} = this.props;
        if (isLoading) {
            if (loader) {
                return loader();
            }
            return (
                <tbody className={"table-loading"}>
                    <tr>
                        <td>{`${translate("list.loading")}`}</td>
                    </tr>
                </tbody>
            );
        } else {
            return null;
        }
    }

    private renderManualFetch() {
        const {isManualFetch, hasMoreData, columns} = this.props;
        const {Button} = defaults;
        if (!Button) {
            throw new Error("Button n'a pas été défini.");
        }
        if (isManualFetch && hasMoreData) {
            return (
                <tfoot className="table-manual-fetch">
                    <tr>
                        <td colSpan={columns.length}>
                            <Button handleOnClick={() => this.handleShowMore()} label="list.button.showMore" type="button" />
                        </td>
                    </tr>
                </tfoot>
            );
        } else {
            return null;
        }
    }

    render() {
        const SELECTABLE_CSS = this.props.isSelectable ? "mdl-data-table--selectable" : "";
        return (
            <table className={`${TABLE_CSS_CLASS} ${SELECTABLE_CSS}`}>
                {this.renderTableHeader()}
                {this.renderTableBody()}
                {this.renderLoading()}
                {this.renderManualFetch()}
            </table>
        );
    }
}
