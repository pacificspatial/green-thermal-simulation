import {standardLayerProps} from "@_map/mapbox/layers/common.js"
import PropTypes from "prop-types"
import {useCallback, useEffect, useMemo} from "react"
import _ from "ansuko"
import { eve } from "react-eve-hook"
import {
    useStandardGeoJsonLayer,
    zoomInterpolate,
    addGeojsonSource, addLayer, OverwriteMode, removeClickEvent, addClickEvent,
    EVENT_ENTER_EDIT_POINT, EVENT_LEAVE_EDIT_POINT
} from "@team4am/fp-core"

const SourceName = "edit-tree"

export const LayerName = {
    Circle: {id: "edit-tree-circle-layer", at: 1},
    Buffer: {id: "edit-tree-circle-buffer", at: 2},
}

const MapBoxEditTreeLayer = ({map, style, geojson, visible, onInit, onChange}) => {

    const canvas = useMemo(() => map?.getCanvasContainer(), [map])

    const initLayer = useCallback((setInitialized) => {
        if (!map) { return }
        addGeojsonSource(map, SourceName, {type: "MultiPoint", coordinates: [[135.81650145608555,34.67865744397229]]})

        addLayer(map, {
            id: LayerName.Circle.id,
            type: "circle",
            source: SourceName,
            paint: {
                circleColor: '#2066cf',
                circleOpacity: 0.8,
                circleRadius: zoomInterpolate({8:1,10:3,14:5,18:11}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1}),
            },
        }, OverwriteMode.Rewrite)
        addLayer(map, {
            id: LayerName.Buffer.id,
            type: "circle",
            source: SourceName,
            paint: {
                circleColor: "#ffffff",
                circleOpacity: 0.01,
                circleRadius: zoomInterpolate({8:1,10:8,14:10,18:16}),
            },
        }, OverwriteMode.Rewrite)

        setInitialized(true)
        _.waited(() => onInit)
    }, [map, geojson])


    const {initialized} = useStandardGeoJsonLayer({
        LayerName,
        SourceName,
        map, style, visible,
        geojson,
        onInit,
        initLayer,
    })

    return null
}
MapBoxEditTreeLayer.propTypes = {
    ...standardLayerProps,
    geojson: PropTypes.object,
    onChange: PropTypes.func,
}
export default MapBoxEditTreeLayer