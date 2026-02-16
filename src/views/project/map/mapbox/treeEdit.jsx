import PropTypes from "prop-types"
import { Autocomplete, Box, Button, IconButton, MenuItem, Select, TextField } from "@mui/material"
import {
    Edit as EditIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckIcon,
} from "@mui/icons-material"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import _ from "ansuko"
import { useDialog } from "@_components/dialog.jsx"
import { LayerName } from "@_map/mapbox/layers/editTree.jsx"
import * as turf from "@turf/turf"
import { eve, useEveListen } from "react-eve-hook"
import { diff } from "deep-object-diff"
import {
    UseApiManager,
    AppDataContext,
    EVENT_ENTER_EDIT_POINT,
    EVENT_LEAVE_EDIT_POINT,
    EVENT_RESET_DATA,
} from "@team4am/fp-core"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: '1',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '1px 1px 3px #000',
    },
    edit: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            padding: '8px',
            alignItems: 'center',
        },
        input: {
            minWidth: "140px",
        },
        buttons: {
            box: {
                display: 'flex',
                alignItems: 'center',
                gap: "4px",
            },
            button: {},
            icon: {}
        },
    }
}

const ProjectMapMapboxTreeEditView = ({ map, geojson, onChange }) => {

    const currentGeoJson = useRef()
    const { state: appState } = useContext(AppDataContext)
    const [names, setNames] = useState(["イチョウ", "ケヤキ", "クスノキ"])
    const [name, setName] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const { PostRows } = UseApiManager()
    const canvas = useMemo(() => map?.getCanvasContainer(), [map])
    const { openAlert } = useDialog()

    const edited = useMemo(() => diff(currentGeoJson.current, geojson), [geojson])

    const onMapMouseMove = useCallback(e => {

        const features = map.queryRenderedFeatures(e.point, {
            layers: [LayerName.Buffer.id]
        })
        if (!_.isEmpty(features) && isEditing) {
            eve(EVENT_ENTER_EDIT_POINT, e)
        } else {
            eve(EVENT_LEAVE_EDIT_POINT)
        }

        canvas.style.cursor = 'pointer'
    }, [canvas, isEditing])

    const onMapMouseOut = useCallback(() => {
        eve(EVENT_LEAVE_EDIT_POINT)
        canvas.style.cursor = "grab"
    }, [canvas])

    const onClickMap = useMemo(() => _.debounce(e => {
        if (!map) { return }

        const features = map.queryRenderedFeatures(e.point, {
            layers: [LayerName.Buffer.id]
        })
        if (!_.isEmpty(features)) {
            const p = turf.point([e.lngLat.lng, e.lngLat.lat])
            const coordinates = [...geojson.coordinates.sort((v1, v2) => turf.distance(p, turf.point(v1)) - turf.distance(p, turf.point(v2))).slice(1)]
            eve(EVENT_LEAVE_EDIT_POINT)
            return onChange({
                type: "MultiPoint",
                coordinates,
            })
        }

        if (!name) {
            return openAlert("先に種名を選択してください")
        }
        onChange({
            type: "MultiPoint",
            coordinates: [
                ...(geojson?.coordinates ?? []),
                [e.lngLat.lng, e.lngLat.lat],
            ].filter(Boolean)
        })
    }, 100), [map, name, geojson])

    const onOpenEditor = useCallback(() => {
        currentGeoJson.current = geojson
        setIsEditing(true)
    }, [map])

    const onCloseEdit = useCallback(() => {
        setIsEditing(false)
    }, [map])

    const onCancelEdit = useCallback(() => {
        onChange(currentGeoJson.current)
        _.waited(() => {
            setIsEditing(false)
        }, 2)
    }, [map])

    useEffect(() => {
        if (!map || !isEditing || !canvas) { return }

        map.on("mousemove", onMapMouseMove)
        map.on("mouseout", onMapMouseOut)

        return () => {
            map.off("mousemove", onMapMouseMove)
            map.off("mouseout", onMapMouseOut)
        }
    }, [isEditing, map, canvas])

    useEffect(() => {
        if (!map || !isEditing) { return }

        map.on("click", onClickMap)

        return () => {
            map.off("click", onClickMap)
        }
    }, [map, name, isEditing, geojson])

    useEveListen(EVENT_RESET_DATA, () => setIsEditing(false))

    return (
        <Box style={styles.root}>
            {!isEditing && (
                <IconButton style={styles.edit.buttons.button} onClick={onOpenEditor}>
                    <EditIcon style={styles.edit.buttons.icon} />
                </IconButton>
            )}
            {isEditing && (
                <Box style={styles.edit.box}>
                    <Autocomplete
                        size="small"
                        sx={styles.edit.input}
                        value={name}
                        onChange={(_x, v) => setName(v)}
                        renderInput={param => <TextField {...param} label="種名" />}
                        options={names} />
                    <Box sx={styles.edit.buttons.box}>
                        <IconButton sx={{ ...styles.edit.buttons.button, color: "red" }} size="small" variant="contained" onClick={onCancelEdit}><CancelIcon /></IconButton>
                        <IconButton disabled={!edited} sx={{ ...styles.edit.buttons.button, color: "green" }} size="small" variant="contained" onClick={onCloseEdit}><CheckIcon /></IconButton>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
ProjectMapMapboxTreeEditView.propTypes = {
    map: PropTypes.any,
    geojson: PropTypes.object,
    onChange: PropTypes.func.isRequired,
}

export default ProjectMapMapboxTreeEditView