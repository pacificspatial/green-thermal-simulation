import { useState } from "react"
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import MapboxView from "./mapbox"
import CesiumView from "./cesium"
import { commonPropTypes } from "@_views/common"
import { useEveListen } from "react-eve-hook"
import { EVENT_ENTER_EDIT_POINT, EVENT_LEAVE_EDIT_POINT } from "@team4am/fp-core"
import { useGridNativeEventListener } from "@mui/x-data-grid"

const MapMode = {
    Mapbox: "mapbox",
    Cesium: "cesium",
}

const styles = {
    root: {
        flexGrow: 1,
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
    },
    toggle: {
        box: {
            position: "absolute",
            bottom: "2rem",
            left: "1rem",
            zIndex: 3,
            background: "white",
        },
        button: {

        },
    },
    tooltip: {
        box: {
            position: 'absolute',
            zIndex: '100',
            background: 'rgba(84, 84, 84, 0.81)',
            top: '100px',
            left: '100px',
            borderRadius: '4px',
            border: '1px solid rgb(150, 150, 150)',
            boxShadow: 'rgb(153, 153, 153) 0px 0px 1px',
            transform: 'translate(-50%, calc(-100% - 4px))',
        },
        text: {
            fontSize: '12px',
            color: 'white',
            margin: '4px 8px',
        },
    }
}

const ProjectMapView = ({ data, onChange }) => {

    const [mapMode, setMapMode] = useState(MapMode.Mapbox)
    const [tooltip, setTooltip] = useState(null)

    useEveListen(EVENT_ENTER_EDIT_POINT, e => {
        setTooltip({
            text: "クリックで削除",
            left: e.point.x,
            top: e.point.y,
        })
    })
    useEveListen(EVENT_LEAVE_EDIT_POINT, e => {
        setTooltip(null)
    })

    return (
        <Box sx={styles.root}>
            {mapMode === MapMode.Mapbox && (<MapboxView data={data} onChange={onChange} />)}
            {mapMode === MapMode.Cesium && (<CesiumView data={data} />)}
            <ToggleButtonGroup size="small" sx={styles.toggle.box} value={mapMode} exclusive onChange={(_x, v) => setMapMode(v)}>
                <ToggleButton size="small" sx={styles.toggle.button} value={MapMode.Mapbox} onClick={() => { setMapMode(MapMode.Mapbox) }}>2D</ToggleButton>
                <ToggleButton size="small" sx={styles.toggle.button} value={MapMode.Cesium} onClick={() => setMapMode(MapMode.Cesium)}>3D</ToggleButton>
            </ToggleButtonGroup>
            {tooltip && (
                <Box style={{ ...styles.tooltip.box, top: tooltip.top, left: tooltip.left }}>
                    <Typography style={styles.tooltip.text}>{tooltip.text}</Typography>
                </Box>
            )}
        </Box>
    )
}
ProjectMapView.propTypes = commonPropTypes

export default ProjectMapView