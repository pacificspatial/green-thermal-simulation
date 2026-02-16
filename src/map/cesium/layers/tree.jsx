import PropTypes from "prop-types"
import {useCallback, useEffect, useRef} from "react"
import * as Cesium from "cesium"

const CesiumTreeLayer = ({viewer, enable}) => {

    const tileset = useRef()

    useEffect(() => {
        if (!viewer?.scene || tileset.current || !enable) {
            return
        }

        Cesium.IonResource.fromAssetId(4134997, {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY'
        })
            .then(res => Cesium.Cesium3DTileset.fromUrl(res))
            .then(ts => {
                tileset.current = ts
                viewer?.scene?.primitives.add(ts)
            })

        return () => {
            try {
                tileset.current ?? viewer?.scene?.primitives.remove(tileset.current)
            } catch{}
            tileset.current = null
        }

    }, [viewer]);

}
CesiumTreeLayer.propTypes = {
    viewer: PropTypes.object,
    enable: PropTypes.bool,
}

export default CesiumTreeLayer