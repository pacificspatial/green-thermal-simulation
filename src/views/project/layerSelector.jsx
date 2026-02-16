import { useCallback, useMemo, useRef, useState } from "react"
import { Divider, IconButton, Menu, MenuItem } from "@mui/material"
import { Layers as LayersIcon, Check as CheckIcon } from "@mui/icons-material"
import deepmerge from "deepmerge"
import PropTypes from "prop-types"

const baseSytles = {
    root: {
        position: 'absolute',
        zIndex: '1',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '1px 1px 8px #333',
        '&:hover': {
            background: "white",
        }
    },
}

const MapLayerSelectorView = ({ style, layersConfig, visibleLayers, onChange }) => {

    const buttonRef = useRef()
    const styles = useMemo(() => deepmerge(baseSytles, { root: style }), [style])
    const [isOpen, setIsOpen] = useState(false)

    const toggleLayer = useCallback(l => {
        const layers = [...visibleLayers]
        if (layers.includes(l)) { layers.splice(layers.indexOf(l), 1) }
        else { layers.push(l) }
        onChange(layers.filter(Boolean))
    }, [visibleLayers])

    return (
        <>
            <IconButton sx={{ ...styles.root }} ref={buttonRef} onClick={() => setIsOpen(true)}>
                <LayersIcon sx={styles.layers} />
            </IconButton>
            <Menu anchorEl={buttonRef.current} open={isOpen} onClose={() => setIsOpen(false)}>
                {layersConfig?.map((layer, i) => {
                    if (typeof layer === "string" && layer === "divider") {
                        return (<Divider key={`divider-${i}`} />)
                    }
                    return (
                        <MenuItem key={`layer_${i}`} onClick={() => toggleLayer(layer.key)} value={layer.key}>
                            <CheckIcon sx={layer.icon} style={{ color: visibleLayers.includes(layer.key) ? "black" : "white" }} />
                            {layer.name}
                        </MenuItem>

                    )
                })}
            </Menu>
        </>
    )

}

MapLayerSelectorView.propTypes = {
    style: PropTypes.object,
    visibleLayers: PropTypes.array.isRequired,
    layersConfig: PropTypes.array.isRequired,
}

export default MapLayerSelectorView
