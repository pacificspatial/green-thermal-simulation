import { Box } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import * as Cesium from "cesium"
import _ from "ansuko"
import {
    useCesium,
    CesiumStandardAssetLayer as AssetLayer,
    AppDataContext
} from "@team4am/fp-core"

const styles = {
    root: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    }
}

Cesium.Ion.defaultAccessToken =
    import.meta.env.VITE_CESIUM_DEEFAULT_ACCESS_TOKEN
window.CESIUM_BASE_URL = "./cesium"

const basemapDef = {
    id: "echigokyuryo_dem_with_ellipsoidal_height_v2",
    name: "地形",
    type: "basemap",
    index: 1,
    asset_id: parseInt(import.meta.env.VITE_CESIUM_BASEMAP_ASSET_ID),
    access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE",
    version: "2023/10/4",
}

const MainReportCesiumView = ({ data }) => {

    const mapRef = useRef()
    const { state: appState } = useContext(AppDataContext)
    const destination = useMemo(() =>
        (data?.longitude && data?.latitude) ? Cesium.Cartesian3.fromDegrees(_.toNumber(data.longitude), _.toNumber(data.latitude), 600.0) : null
        , [data?.longitude, data?.latitude])

    const onFeatureClick = useCallback(() => {
        // Nothing to do
    }, [])

    const { viewer } = useCesium({
        mapRef,
        basemapDef,
        onFeatureClick,
    })

    const [entities, setEntities] = useState()

    useEffect(() => {
        if (!viewer || !appState.env || !destination) { return }
        const orientation = {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
        }
        viewer.camera.setView({
            destination,
            orientation,
            mapProjection: new Cesium.WebMercatorProjection(),
        })
    }, [viewer, appState.env, destination]);


    useEffect(() => {
        if (!data?.assetId || !viewer) { return }

        const position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.height)
        const headingPitchRoll = new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(data.heading),
            Cesium.Math.toRadians(data.pitch),
            Cesium.Math.toRadians(0),
        )
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, headingPitchRoll)
        const scale = data.scale
        const minimumPixelSize = 0
        const color = Cesium.Color.WHITE.withAlpha(0.6)

        Cesium.IonResource.fromAssetId(parseInt(data.assetId), {
            accessToken: data.assetAccessToken,
        })
            .then(uri => {
                setEntities(viewer.entities.add({
                    position,
                    orientation,
                    model: { uri, scale, minimumPixelSize, color }
                }))
            })
    }, [data.assetId, viewer])

    useEffect(() => {
        if (!viewer || !entities) { return }
        viewer.trackedEntity = entities
    }, [viewer, entities]);


    return (
        <Box style={styles.root} ref={mapRef}>
            <AssetLayer viewer={viewer} assetId={3984926} enable={true} accessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY" />
            <AssetLayer viewer={viewer} assetId={4134997} enable={true} accessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY" />
        </Box>
    )
}
export default MainReportCesiumView
