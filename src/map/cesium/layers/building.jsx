import PropTypes from "prop-types"
import {useEffect, useRef} from "react"
import * as Cesium from "cesium"

const CesiumBuildingLayer = ({viewer, enable}) => {

    const tileset = useRef()

    useEffect(() => {
        if (!viewer?.scene || tileset.current || enable) { return }

        Cesium.IonResource.fromAssetId(3984926, {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY'
        }).then(res => {
            Cesium.Cesium3DTileset.fromUrl(res)
                .then(_tileset => {
                    tileset.current = _tileset
                    viewer?.scene?.primitives.add(_tileset)
                })
        })

        return () => {
            try {
                tileset.current && viewer?.scene?.primitives.remove(tileset.current)
            } catch {}
            tileset.current = null
        }
    }, [viewer])

    return null
}

CesiumBuildingLayer.propTypes = {
    viewer: PropTypes.any,
    enable: PropTypes.bool,
}

export default CesiumBuildingLayer