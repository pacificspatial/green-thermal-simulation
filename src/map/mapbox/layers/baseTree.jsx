import {standardLayerProps} from "@_map/mapbox/layers/common.js"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {
    UseApiManager,
    useStandardVectorLayer,
    zoomInterpolate,
    AppDataContext,
    EVENT_REFRESH_LAYER,
} from "@team4am/fp-core"

const SourceName = "base-tree"

export const LayerName = {
    Circle: {id: "base-tree-circle-layer", at: 1},
}

const MapBoxBaseTreeLayer = ({map, style, visible, onInit}) => {

    const { state:appState } = useContext(AppDataContext)
    const [url, setUrl] = useState()
    const { QueryVectorTileUrl } = UseApiManager()

    const onRender = useMemo(() => ({
            id: LayerName.Circle.id,
            type: "circle",
            source: SourceName,
            sourceLayer: "layer0",
            paint: {
                circleColor: '#539e3e',
                circleOpacity: 0.5,
                circleRadius: zoomInterpolate({8:1,10:2,14:4,18:6}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1}),
            }
    }), [])

    useStandardVectorLayer({
        LayerName,
        SourceName,
        map,style, visible,
        url,
        enableCacheBuster: true,
        eventName: EVENT_REFRESH_LAYER,
        onInit,
        onRender,
    })

    useEffect(() => {
        QueryVectorTileUrl(`SELECT * FROM ${appState.env.CLIENT_VIEWS_TREE}`).then(setUrl)
    }, [])

    return null
}
MapBoxBaseTreeLayer.propTypes = {
    ...standardLayerProps
}
export default MapBoxBaseTreeLayer