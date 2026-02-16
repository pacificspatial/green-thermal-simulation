import { memo, useCallback, useMemo } from "react"
import { Box, styled, Typography } from "@mui/material"
import NumberTextField from "@_views/common.jsx"
import PropTypes from "prop-types"
import _ from "ansuko"

export const ProjectInputBase = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: "8px",
})

export const ProjectInputTitle = memo(({ children }) => {
    return (
        <Box><Typography style={{ fontWeight: "bold" }}>{children}</Typography></Box>
    )
})
ProjectInputTitle.propTypes = {
    children: PropTypes.node.isRequired,
}

export const ProjectInputBox = styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
})

export const ProjectInputBoxTitle = memo(({ title }) => {
    return (
        <Box>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>{title}</Typography>
        </Box>
    )
})
ProjectInputBoxTitle.propTypes = {
    title: PropTypes.string,
}

export const ProjectInputBoxValue = styled(Box)({

})

export const ProjectInputField = memo(props => {

    const value = useMemo(() => props.data?.[props.field], [props.data, props.field])

    const _onChange = useCallback(e => props.onChange({ [props.field]: _.toNumber(e.target.value) })
        , [props.onChange, props.field])

    return (
        <ProjectInputBox>
            <ProjectInputBoxTitle {...props} />
            <ProjectInputBoxValue>
                <NumberTextField {...props} value={value} onChange={_onChange} />
            </ProjectInputBoxValue>
        </ProjectInputBox>
    )
})
ProjectInputField.propTypes = {
    ...ProjectInputBoxTitle.propTypes,
    ...NumberTextField.propTypes,
}
