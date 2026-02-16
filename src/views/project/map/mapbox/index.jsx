import { Box } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import BaseTreeLayer from "@_map/mapbox/layers/baseTree"
import EditTreeLayer from "@_map/mapbox/layers/editTree"
import _ from "ansuko"
import maplibregl, { GeolocateControl, NavigationControl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import StyleSelector from "@_views/project/styleSelector.jsx"
import LayerSelector from "@_views/project/layerSelector.jsx"
import { MapStyleDefs } from "@_map/styles/index.js"
import axios from "axios"
import TreeEditView from "./treeEdit"
import { _m, sortLayers, AppDataContext } from "@team4am/fp-core"

const MapLayer = {
    BaseTree: "base_tree",
    EditTree: "edit_tree",
}

const styles = {
    root: {
        width: "100%",
        height: "100%",
    }
}

const ProjectMapMapboxView = ({ data, onChange }) => {

    const { state: appState } = useContext(AppDataContext)
    const mapRef = useRef()
    const maplibreRef = useRef()
    const [map, setMap] = useState()
    const [style, setStyle] = useState()
    const [styleKey, setStyleKey] = useState(Object.values(MapStyleDefs).find(s => s.default).key)
    const [initializedLayers, setInitializedLayers] = useState([])


    const initMap = useCallback(() => {
        if (!style) { return }

        if (maplibreRef.current) {
            maplibreRef.current.setStyle(style)
            return
        }

        let center = data?.camera_position?.center ?? [
            appState.env.CLIENT_MAP_CENTER_LONGITUDE,
            appState.env.CLIENT_MAP_CENTER_LATITUDE
        ]
        const zoom = data?.camera_position?.zoom ?? 16
        const mapOptions = {
            container: mapRef.current,
            center,
            zoom,
            style,
            localIdeographFontFamily: "'Noto Sans JP', 'Roboto'",
        }

        const m = new maplibregl.Map(mapOptions)

        m.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserLocation: true,
                showAccuracyCircle: true,
                fitBoundsOptions: {
                    maxZoom: 21,
                },
            }),
            "top-right",
        )

        m.addControl(
            new NavigationControl({
                visualizePitch: true,
                showZoom: false,
            })
        )

        m.on("load", async () => {
            maplibreRef.current = m
            setMap(m)
        })

    }, [style, appState.env, data])


    const onInitLayer = useCallback(l => {
        setInitializedLayers(prev => {
            const set = new Set(prev)
            set.add(l)
            return Array.from(set)
        })
    }, [])

    useEffect(() => {
        if (_.isEmpty(initializedLayers)) { return }
        if (_.isEqual(initializedLayers?.sort(), Object.values(MapLayer)?.sort())) {
            sortLayers(map, [
                BaseTreeLayer.LayerName,
                EditTreeLayer.LayerName,
            ])
        }
    }, [initializedLayers])

    useEffect(() => {
        if (!styleKey) { return }
        axios.get(`/resources/map_style/${styleKey}.json5`)
            .then(res => {
                const styleJson = JSON.stringify(res.data)
                    .replace('{{API_ENDPOINT}}', appState.env.CLIENT_MAP_TILE_ENDPOINT)
                const s = _m(JSON.parse(styleJson))
                setStyle(s)
            })
    }, [styleKey])

    useEffect(() => {
        if (!style) { return }
        initMap()
    }, [style])

    useEffect(() => {

        return () => {
            maplibreRef.current?.remove()
            maplibreRef.current = null
        }
    }, []);

    return (
        <Box ref={mapRef} sx={styles.root}>
            <BaseTreeLayer map={map} style={style} visible={true} onInit={() => onInitLayer(MapLayer.BaseTree)} />
            <EditTreeLayer
                map={map}
                style={style}
                geojson={data?.edit_geojson}
                onIit={() => onInitLayer(MapLayer.EditTree)}
            />
            <StyleSelector style={{ right: "1rem", bottom: "3rem" }} styleKey={styleKey} onSelect={setStyleKey} />
            <TreeEditView map={map} geojson={data?.edit_geojson} onChange={edit_geojson => onChange({ edit_geojson })} />
        </Box>
    )
}
ProjectMapMapboxView.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
}

export default ProjectMapMapboxView
