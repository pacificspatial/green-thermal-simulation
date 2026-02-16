import {
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover
} from "@mui/material";
import { Map as MapIcon, Check as CheckIcon } from "@mui/icons-material"
import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { MapStyleDefs } from "@_map/styles"

const styles = {
    button: {
        position: 'absolute',
        zIndex: '1',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '1px 1px 8px #333',
    }
}

const StyleSelectorView = ({ onSelect, style, styleKey }) => {

    const ref = useRef()

    const [open, setOpen] = useState(false)
    const styleItems = useMemo(() =>
        Object.values(MapStyleDefs)
            .sort((v1, v2) => v1.menuSort - v2.menuSort)
        , [MapStyleDefs])

    const onClose = () => {
        setOpen(false)
    }

    return (
        <>
            <IconButton style={{ ...style, ...styles.button }} ref={ref} onClick={() => setOpen(prev => !prev)}>
                <MapIcon />
            </IconButton>
            <Popover
                anchorEl={ref.current}
                open={open}
                onClose={onClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <List dense="dense" style={{ float: "none" }}>
                    {styleItems.map(s => {
                        return (
                            <ListItem key={s.key} disablePadding={true} >
                                <ListItemButton onClick={() => {
                                    if (s.key !== styleKey) onSelect(s.key)
                                }}>
                                    {s.key === styleKey && <ListItemIcon><CheckIcon /></ListItemIcon>}
                                    <ListItemText inset={s.key !== styleKey} primary={s.title} />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Popover>
        </>
    )

}
StyleSelectorView.propTypes = {
    style: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
}

export default StyleSelectorView