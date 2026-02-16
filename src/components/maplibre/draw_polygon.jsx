import PropTypes from "prop-types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box, IconButton, Divider, Tooltip } from "@mui/material"
import {
    PentagonOutlined as DrawPolygonIcon,
    HighlightAlt as SelectPolygonIcon,
    JoinFull as UnionPolygonIcon,
} from "@mui/icons-material"
import * as turf from "@turf/turf"
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter"
import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode, TerraDrawRenderMode } from "terra-draw"
import { v4 as uuid_v4 } from "uuid"
import _ from "ansuko"
import { useEveListen } from "react-eve-hook"
import { EVENT_RESET_DATA } from "@team4am/fp-core"

const DrawMode = {
    Drawing: "drawing",
    Selecting: "selecting",
    Removing: "removing",
}

const styles = {
    box: {
        position: 'absolute',
        top: '6rem',
        right: '10px',
        zIndex: '3',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 2px',
        borderRadius: '3px',
        width: "40px",
    },
    divider: {
        margin: "0 4px",
    }
}

const MaplibreDrawPolygon = ({ map, style, styleKey, disable, geojson, onChange, controlProps }) => {

    const isInitialized = useRef(false)
    const isUpdatingInternally = useRef(false)
    const drawInstanceRef = useRef()
    const [isDrawReady, setIsDrawReady] = useState(false)
    const [drawMode, setDrawMode] = useState(null)

    const fixedTerraDrawCoordinates = useCallback(obj => {
        if (Array.isArray(obj) && _.size(obj) === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1])) {
            obj = [
                _.toNumber((obj[0]).toFixed(9)),
                _.toNumber((obj[1]).toFixed(9)),
            ]
        } else if (Array.isArray(obj)) {
            obj = obj.map(fixedTerraDrawCoordinates)
        } else if (typeof obj === "object" && _.has(obj, "features")) {
            obj.features = obj.features.map(fixedTerraDrawCoordinates)
        } else if (typeof obj === "object" && _.has(obj, "geometry")) {
            obj.coordinates = obj.coordinates.map(fixedTerraDrawCoordinates)
        } else if (typeof obj === "object" && _.has(obj, "coordinates")) {
            obj.coordinates = obj.coordinates.map(fixedTerraDrawCoordinates)
        }
        return obj
    }, [])

    const onUnionPolygon = useCallback(() => {
        if (!geojson) { return }

        const draw = drawInstanceRef.current

        const features = draw.getSnapshot()
        const currentIds = features.map((feature) => feature.id)
        const g = turf.union(turf.featureCollection(
            features.map(f => turf.feature(f.geometry))
        ))
        if (g.geometry.type.toLowerCase() === "polygon") {
            g.geometry.type = "MultiPolygon"
            g.geometry.coordinates = [[_.first(g.geometry.coordinates)]]
        }
        const gjson = fixedTerraDrawCoordinates(g.geometry)
        isInitialized.current = false
        _.waited(() => {
            onChange({ geojson: gjson })
        }, 10)
    }, [geojson])

    const drawPolygon = useCallback(() => {
        if (!drawInstanceRef.current || !geojson) { return }
        const draw = drawInstanceRef.current
        try { draw.clear() } catch { }
        isUpdatingInternally.current = true
        const features = geojson.coordinates.map(coordinates => ({
            id: uuid_v4(),
            geometry: { type: "Polygon", coordinates },
            properties: { mode: "polygon" },
            type: "Feature"
        }))
        features.forEach(feature => {
            draw.addFeatures([feature])
        })

        try {
            const bbox = turf.bbox(geojson)
            map.fitBounds(bbox, {
                padding: 100,
                maxZoom: 19,
                animate: true,
                duration: 300,
            })
        } catch (e) {
            console.error("[DrawPolygon]", "bbox計算エラー", e)
        }

        _.waited(() => {
            isUpdatingInternally.current = false
        }, 10)

    }, [map, geojson])

    const initialDraw = useCallback(() => {
        if (!map) { return }
        if (drawInstanceRef.current?.mode === "select") { return }
        setIsDrawReady(false)
        isUpdatingInternally.current = true
        isInitialized.current = false


        if (drawInstanceRef.current) {
            try {
                drawInstanceRef.current.clear()
                drawInstanceRef.current.stop()
            } catch { }
            drawInstanceRef.current = null
        }

        const draw = new TerraDraw({
            adapter: new TerraDrawMapLibreGLAdapter({ map }),
            modes: [
                new TerraDrawRenderMode({ modeName: "render", styles: {} }),
                new TerraDrawPolygonMode({
                    modeName: "polygon",
                    pointerDistance: 20,
                }),
                new TerraDrawSelectMode({
                    modeName: "select",
                    flags: {
                        arbitary: {
                            feature: {
                                draggable: true,
                                rotateable: false,
                                scaleable: false,
                                coordinates: {
                                    midpoints: true,
                                    draggable: true,
                                    deletable: true
                                }
                            }
                        },
                        polygon: {
                            feature: {
                                draggable: true,
                                coordinates: {
                                    midpoints: true,
                                    draggable: true,
                                    deletable: true
                                }
                            }
                        }
                    }
                }),
            ]
        })
        drawInstanceRef.current = draw
        draw.on("ready", () => {
            _.waited(() => {
                isUpdatingInternally.current = false
                isInitialized.current = true
                setIsDrawReady(true)
            }, 10)
        })

        draw.start()
        draw.setMode('render')
        draw.on("change", onDrawChanged)


    }, [map, geojson])


    useEffect(() => {
        if (!map) { return }
        initialDraw()
    }, [map])

    useEffect(() => {
        if (!map) { return }
        map.once("styledata", () => {
            initialDraw()
        })
    }, [styleKey])

    useEveListen(EVENT_RESET_DATA, () => {
        const draw = drawInstanceRef.current
        try {
            draw.setMode("render")
            draw.stop()
            _.waited(() => {
                initialDraw()
            }, 30)
        } catch { }
    })

    useEffect(() => {
        if (!map || !isDrawReady || isUpdatingInternally.current) { return }
        const draw = drawInstanceRef.current
        if (!geojson) {
            draw.clear()
        } else {
            drawPolygon()
        }
    }, [geojson, isDrawReady])

    const onDrawChanged = useMemo(() => _.debounce(() => {
        if (isUpdatingInternally.current) return

        const draw = drawInstanceRef.current

        const features = draw.getSnapshot().filter(feature => {

            if (feature.geometry.type === "Point") return false
            if (feature.properties?.closingPoint) return false
            return true
        })


        if (features.length === 0) {
            onChange?.({ geojson: null })
            return
        }

        const multiPolygon = {
            type: "MultiPolygon",
            coordinates: features.map(({ geometry }) => geometry.coordinates),
        }

        isUpdatingInternally.current = true
        let isClosingRing = true
        for (const polygon of multiPolygon.coordinates) {
            for (const coords of polygon) {
                if (!_.isEqual(_.first(coords), _.last(coords))) {
                    isClosingRing = false
                }
            }
        }
        onChange?.({ geojson: multiPolygon })

        _.waited(() => {
            isUpdatingInternally.current = false
        }, 10)
    }, 300), [])


    useEffect(() => {
        if (!drawInstanceRef.current) return

        const draw = drawInstanceRef.current

        switch (drawMode) {
            case DrawMode.Drawing:
                draw.setMode('polygon')
                break
            case DrawMode.Selecting:
                draw.setMode('select')
                break
            case DrawMode.Removing:
                draw.setMode('render')
                break
            default:
                draw.setMode('render')
        }
    }, [drawMode])

    const handleDrawModeClick = (mode) => {
        if (drawMode === mode) {

            setDrawMode(null)
        } else {
            setDrawMode(mode)
        }
    }

    return (
        <Box {...controlProps} sx={{ ...styles.box, ...controlProps?.sx }}>
            <Tooltip title="図形を描画します">
                <IconButton
                    disabled={disable || !map}
                    onClick={() => handleDrawModeClick(DrawMode.Drawing)}
                    color={drawMode === DrawMode.Drawing ? "primary" : "default"}
                    className="draw-polygon-draw-button"
                >
                    <DrawPolygonIcon />
                </IconButton>
            </Tooltip>
            <Divider sx={styles.divider} />
            <Tooltip title="図形を選択します">
                <IconButton
                    size="small"
                    disabled={disable || !map}
                    onClick={() => handleDrawModeClick(DrawMode.Selecting)}
                    color={drawMode === DrawMode.Selecting ? "primary" : "default"}
                    className="draw-polygon-select-button"
                >
                    <SelectPolygonIcon size={20} />
                </IconButton>
            </Tooltip>
            <Divider sx={styles.divider} />
            <Tooltip title="複数の図形を結合します">
                <IconButton
                    size="small"
                    disabled={disable || !map || _.size(geojson?.coordinates) <= 1}
                    onClick={onUnionPolygon}
                    className="draw-polygon-select-button"
                >
                    <UnionPolygonIcon size={20} />
                </IconButton>
            </Tooltip>
        </Box>
    )
}

MaplibreDrawPolygon.propTypes = {
    map: PropTypes.object,
    disable: PropTypes.bool,
    style: PropTypes.object,
    styleKey: PropTypes.string,
    geojson: PropTypes.object,
    onChange: PropTypes.func,
    controlProps: PropTypes.object,
}

export default MaplibreDrawPolygon