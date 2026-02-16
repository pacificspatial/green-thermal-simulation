export const MapLayerMenuGroups = {
    main: {
        multiSelect: true,
        order: 1,
    },
    tree: {
        multiSelect: true,
        order: 2,
    },
    error: {
        multiSelect: false,
        order: 3,
    }
}

export const MainMapLayerDefs = {
    tree: {onTouch: "select_tree", label: "樹木", menuGroup: "tree", filter: "tree", at: 6},
    asesCompC: {onTouch: "select_tree", label: "総合評価C", menuGroup: "error", defaultVisible: false, filter: "tree", at: 7},
}