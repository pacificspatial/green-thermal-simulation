import { Box, Backdrop, CircularProgress } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import * as Cesium from "cesium"
import _ from "ansuko"

const styles = {
    root: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    },
    loading: {
        box: {
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
            background: "#d1d1d17e",
            zIndex: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
    }
}

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY"
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

const MainReportSampleView = ({ data }) => {

    const mapRef = useRef()
    const [loading, setLoading] = useState(true)

    const initView = useCallback(async () => {
        const viewer = new Cesium.Viewer(mapRef.current, {
          sceneMode: Cesium.SceneMode.SCENE3D,
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          homeButton: false,
          vrButton: false,
          geocoder: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          shadows: true,
          shouldAnimate: true,
          clampToHeightSupported: true,
        });

        // =========================
        // 共通：置き場所＆姿勢（glb用）
        // =========================
        const lon1 = 139.75900;
        const lat1 = 35.684000;
        const height1 = 0.5; // glb 用

        const heading1 = Cesium.Math.toRadians(90);
        const pitch1 = Cesium.Math.toRadians(90);
        const roll1 = Cesium.Math.toRadians(0);
        const scale1 = 1.0;

        const position1 = Cesium.Cartesian3.fromDegrees(lon1, lat1, height1);
        const hpr1 = new Cesium.HeadingPitchRoll(heading1, pitch1, roll1);
        const orientation1 = Cesium.Transforms.headingPitchRollQuaternion(position1, hpr1);

        // =========================
        // A) 3D Tiles (4134997)
        // =========================
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(4134997);
        viewer.scene.primitives.add(tileset);

        const heightOffset = -35.0; //3Dtiles 用

        // タイルの中心座標を取得
        const center = tileset.boundingSphere.center;
        const cartographic = Cesium.Cartographic.fromCartesian(center);

        // 「現在の中心」と「そこから5m下げた位置」の差分を計算
        const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        const offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
        const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());

        // 3D Tiles 全体を移動
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);


        // defaultStyle があれば適用
        const defaultStyle = tileset.asset?.extras?.ion?.defaultStyle;
        if (Cesium.defined(defaultStyle)) {
            tileset.style = new Cesium.Cesium3DTileStyle(defaultStyle);
        }

        // =========================
        // B) glb (その他)
        // =========================
        // これらは座標を持っていないので、上で作った position1 に配置します
        async function addModel(assetId, alpha, color = Cesium.Color.WHITE) {
            const resource = await Cesium.IonResource.fromAssetId(assetId);

            const entity = viewer.entities.add({
                position: position1,      // 共通の座標 
                orientation: orientation1, // 共通の向き
                model: {
                    uri: resource,
                    scale: scale1,
                    color: color.withAlpha(alpha),
                    colorBlendMode: Cesium.ColorBlendMode.MIX,
                    colorBlendAmount: 0.5,
                }
            });
            return entity;
        }

        // glbアセットの読み込み
        const entityGround = await addModel(4217497, 0.5);
        const entityBldg = await addModel(4217482, 0.8);
        const entityRoad = await addModel(4217479, 0.9);
        const entityWater = await addModel(4217501, 0.2);
        const entityTrees = await addModel(4128018, 1.0);

        // 風だけ特殊設定（元のコード維持）
        const resWind = await Cesium.IonResource.fromAssetId(4219428);
        const entityWind = viewer.entities.add({
            position: position1,
            orientation: orientation1,
            model: {
                uri: resWind,
                scale: 1.0,
                minimumPixelSize: 1,
                color: Cesium.Color.CYAN.withAlpha(0.95),
                colorBlendMode: Cesium.ColorBlendMode.MIX,
                colorBlendAmount: 0.85,
                silhouetteColor: Cesium.Color.WHITE.withAlpha(0.2),
                silhouetteSize: 1.0,
            },
        });

        //温度？
        const lon99 = 139.76030;
        const lat99 = 35.684900;
        const height99 = 1.5; // glb 用

        const heading99 = Cesium.Math.toRadians(90);
        const pitch99 = Cesium.Math.toRadians(90);
        const roll99 = Cesium.Math.toRadians(0);
        const scale99 = 1.0;

        const position99 = Cesium.Cartesian3.fromDegrees(lon99, lat99, height99);
        const hpr99 = new Cesium.HeadingPitchRoll(heading99, pitch99, roll99);
        const orientation99 = Cesium.Transforms.headingPitchRollQuaternion(position99, hpr99);
        const resource99 = await Cesium.IonResource.fromAssetId(4218149);
        const entity99 = viewer.entities.add({
            position: position99,
            orientation: orientation99,
            model: {
                uri: resource99,
                scale: scale99,
                minimumPixelSize: 0,
                color: Cesium.Color.WHITE.withAlpha(0.5)
            },
        });

        viewer.trackedEntity = entityGround;
        await viewer.zoomTo(tileset);
        _.waited(() => {
            setLoading(false)
        }, 30)
    }, [])

    useEffect(() => {
        initView().then()

        return () => {
            setLoading(true)
        }
    }, [])

    return (
        <Box style={styles.root} ref={mapRef}>
            {loading && <Box style={styles.loading.box}><CircularProgress /></Box>}
        </Box>
    )
}
export default MainReportSampleView
