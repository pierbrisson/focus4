import {EntityToType, StoreNode} from "../types";

export type Ligne = EntityToType<typeof LigneEntity>;
export type LigneNode = StoreNode<typeof LigneEntity>;

export const LigneEntity = {
    name: "ligne",
    fields: {
        id: {
            type: "field",
            fieldType: "number",
            domain: {},
            isRequired: true,
            name: "id",
            label: "ligne.id"
        }
    }
} as const;
