
import { Box, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { MapStyleDefs } from "@_map/styles"
import axios from "axios"
import maplibregl, { NavigationControl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import StyleSelector from "./styleSelector"
import HeaderView from "@_views/header.jsx"
import { baseGradient, BaseButton } from "@_views/common"
import _ from "ansuko"
import PropTypes from "prop-types"
import { _m, AppDataContext, MainDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: baseGradient,
        padding: "16px 32px",
        gap: "1rem",
    },
    message: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: "center",
        },
        text: {
            color: "white",
        },
    },
    confirm: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: "8px",
            padding: '4px 16px',
            background: '#b6b3ad',
            borderRadius: '16px',
        },
        text: {
            color: "white",
        },
        buttons: {
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            alignItems: 'center',
        },
    },
    map: {
        flexGrow: 1,
    },
}

const MainProjectMapInitialView = ({ onChange }) => {

    const mapRef = useRef()
    const maplibreRef = useRef()
    const initializing = useRef(false)
    const [styleKey, setStyleKey] = useState(Object.values(MapStyleDefs).find(s => s.default).key)
    const [style, setStyle] = useState()
    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setProject } = useContext(MainDataContext)
    const markerRef = useRef(null)
    const [openConfirm, setOpenConfirm] = useState(false)
    const lastCameraRef = useRef(null)
    const confirmCenter = useRef(null)

    const onClick = useCallback(e => {
        markerRef.current?.remove()

        confirmCenter.current = e.lngLat

        markerRef.current = new maplibregl.Marker()
            .setLngLat(e.lngLat)
            .addTo(maplibreRef.current)

        lastCameraRef.current = {
            center: { ...maplibreRef.current.getCenter() },
            zoom: maplibreRef.current.getZoom(),
        }
        maplibreRef.current.flyTo({
            center: confirmCenter.current,
            zoom: 17,
            duration: 1500,
        })
        setOpenConfirm(true)
    }, [mainState.project])

    const initMap = useCallback(() => {
        if (!style) { return }

        if (maplibreRef.current) {
            maplibreRef.current.setStyle(style)
            initializing.current = false
            return
        }

        let center = [
            appState.env.CLIENT_MAP_CENTER_LONGITUDE,
            appState.env.CLIENT_MAP_CENTER_LATITUDE
        ]
        const zoom = 14
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

        m.on("click", onClick)

        m.on("load", async () => {
            maplibreRef.current = m
            initializing.current = false
        })

    }, [style, appState.env, onClick])

    const onSubmit = useCallback(() => {
        onChange({
            camera_position: {
                center: confirmCenter.current,
                zoom: maplibreRef.current.getZoom(),
            },
        })
        _.waited(() => {
            confirmCenter.current = null
            setOpenConfirm(false)
            lastCameraRef.current = null
        })
    }, [])

    const onCancel = useCallback(() => {
        setOpenConfirm(false)
        maplibreRef.current.flyTo(lastCameraRef.current)
        lastCameraRef.current = null
    }, [])

    useEffect(() => {

    }, [])

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
        if (!style || initializing.current) { return }
        initializing.current = true
        initMap()
    }, [style, initMap])

    useEffect(() => {

        return () => {
            maplibreRef.current?.remove()
            maplibreRef.current = null
            initializing.current = false
        }
    }, []);


    return (
        <Box style={styles.root}>
            <HeaderView title="【新規プロジェクト】">
                <BaseButton onClick={() => setProject(null)}>キャンセル</BaseButton>
            </HeaderView>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {!openConfirm && (
                    <Box sx={styles.message.box}>
                        <Typography sx={styles.message.text}>登録する地点のだいたいの位置でクリックしてください</Typography>
                    </Box>
                )}
                {openConfirm && (
                    <Box sx={styles.confirm.box}>
                        <Typography sx={styles.confirm.text}>この位置から始めて良いですか</Typography>
                        <Box sx={styles.confirm.buttons}>
                            <BaseButton sx={styles.confirm.button} onClick={onSubmit}>はい</BaseButton>
                            <BaseButton sx={styles.confirm.button} onClick={onCancel}>キャンセル</BaseButton>
                        </Box>
                    </Box>
                )}
            </Box>
            <Box style={styles.map} ref={mapRef}>
                <StyleSelector onSelect={setStyleKey} styleKey={styleKey} style={{ right: "1rem", top: "6rem" }} />
            </Box>
        </Box>
    )
}
MainProjectMapInitialView.propTypes = {
    onChange: PropTypes.func,
}
export default MainProjectMapInitialView