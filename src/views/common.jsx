import React, { useCallback, useEffect, useMemo, useRef } from "react"
import PropTypes from "prop-types"
import deepmerge from "deepmerge"
import { Box, styled, Typography, OutlinedInput, InputAdornment, IconButton, Button } from "@mui/material"
import { Start as StartIcon } from "@mui/icons-material"
import _ from "ansuko"
import { useEveListen } from "react-eve-hook"
import { EVENT_RESET_DATA } from "@team4am/fp-core"

export const commonPropTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func.isRequired,
}

export const baseColor = "#255025"
export const baseGradient = "linear-gradient(0deg, #2e8258, #255025)"
export const hoverGradient = "linear-gradient(0deg, #4aa763, #2a8146)"
export const disableGradient = "linear-gradient(0deg, #76847d, #4d524d)"
export const deleteGradient = "linear-gradient(0deg, #e85910, #ff8100)"
export const hoverDeleteGradient = "linear-gradient(0deg, #ff9a00, #e86f28)"

export const okButtonGradient = "linear-gradient(0deg, #6a67bb, #837ce5)"
export const cancelButtonGradient = "linear-gradient(0deg, #977272, #c1969c)"
export const hoverOkButtonGradient = "linear-gradient(0deg, #4e4abc, #5a50e3)"
export const hoverCancelButtonGradient = "linear-gradient(0deg, #945757, #c26f7b)"

const slStyles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        height: "24px",
        marginRight: "1rem",
    },
    label: {
        background: "#FAAC00",
        width: '8px',
        borderRadius: '0 4px 4px 0',
    },
    text: {
        flexGrow: 1,
        color: "white",
        fontWeight: 'bold',
        fontSize: "16px",
        whiteSpace: "nowrap",
    },
}

export const PageBase = styled(Box)({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundImage: baseGradient,
    padding: "16px 32px",
    gap: "1rem",
})

export const SectionLabel = React.memo(({ text, style }) => {

    const styles = useMemo(() => deepmerge({}, slStyles, style), [style])

    return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Box style={styles.root}>
                <Box style={styles.label}></Box>
                <Box style={{ display: "flex", alignItems: "center" }}><Typography sx={styles.text}>{text}</Typography></Box>
            </Box>
        </Box>
    )
})
SectionLabel.propTypes = {
    text: PropTypes.string.isRequired,
    styles: PropTypes.object,
}

export const BaseTextField = styled(OutlinedInput)({
    background: "white",
    height: '32px',
    borderRadius: '8px',
    '& .MuiOutlinedInput-input': {
        fontSize: "15px",
    }
})

const numberTextFieldStyles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
    },
    copy: {
        button: {
            width: 0,
        },
        icon: {
            width: "20px",
        }
    }
}

export const NumberTextField = (props) => {

    const initValueRef = useRef(null)
    const isUpdateInternally = useRef()
    const [value, setValue] = React.useState(props.value)
    const inputRef = useRef()
    const nStyles = numberTextFieldStyles

    const styles = useMemo(() =>
        deepmerge({
            width: "140px",
            '& .MuiInputBase-input': {
                textAlign: 'right',
            },
            '& input::-webkit-outer-spin-button': {
                "-webkit-appearance": "none",
                margin: 0,
            },
            '& input::-webkit-inner-spin-button': {
                "-webkit-appearance": "none",
                margin: 0,
            }
        }, props.sx ?? {})
        , [props.sx])

    const edited = useMemo(() => {
        const v = _.toNumber(props.value)
        const c = _.toNumber(props.calced)
        if (!_.isNumber(c) || !_.isNumber(v)) { return false }
        return c !== v
    }, [props.value, props.calced])

    const onClick = useCallback(e => {
        if (props.onClick) { return props.onClick(e) }
    }, [props.onClick])

    const onChange = useCallback(e => {
        if (isUpdateInternally.current) { return }
        setValue(e.target.value ?? "")
        if (props.onChange) { return props.onChange(e) }
    }, [props.onChange])

    useEffect(() => {
        const newValue = _.toNumber(props.value)
    }, [props.value])

    useEffect(() => {
        initValueRef.current = initValueRef.current ?? props.value
    }, [props.value])

    useEveListen(EVENT_RESET_DATA, () => {
        isUpdateInternally.current = true
        setValue(props.value ?? "")
        _.waited(() => {
            isUpdateInternally.current = false
        }, 10)
    })

    return (
        <BaseTextField
            inputProps={{
                inputMode: "none",
                min: 0,
            }}
            type="number"
            sx={{
                ...styles,
                '& .MuiInputBase-input': {
                    color: edited ? '#33f' : undefined,
                    ...styles['& .MuiInputBase-input'],
                }
            }}
            endAdornment={props.unit ? (<InputAdornment position="end">{props.unit}</InputAdornment>) : null}
            {...props}
            value={value}
            onChange={onChange}
            onClick={onClick}
            inputRef={inputRef}
        />
    )
}


export default NumberTextField


export const BaseButton = styled(Button)({
    height: '40px',
    alignItems: 'center',
    minWidth: "120px",
    color: "white",
    borderRadius: "16px",
    whiteSpace: 'nowrap',
    background: baseGradient,
    '&.Mui-disabled': {
        color: "#ddd",
        background: disableGradient,
    },
    '&:hover': {
        background: hoverGradient,
    },
    display: 'flex',
    flexDirection: 'row',
    gap: '4px'
})
