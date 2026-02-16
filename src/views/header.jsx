import { Box, Button, Typography } from "@mui/material"
import { baseGradient, disableGradient, hoverGradient } from "@_views/common"
import PropTypes from "prop-types"

const styles = {
    root: {
        background: 'white',
        marginBottom: "4px",
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: "8px 0",
    },
    title: {
        box: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: '16px',
        },
        img: {
            height: "24px",
        },
        version: {
            marginLeft: '1rem',
            fontSize: '11px',
            marginTop: '12px',
            color: '#999',
        },
        text: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#255025',
            marginLeft: '1rem',
            whiteSpace: 'nowrap',
        },
    },
    container: {
        box: {
            marginRight: '1rem',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
        },
    },
}


const HeaderView = ({ title, children }) => (
    <Box sx={styles.root}>
        <Box sx={styles.title.box}>
            <img style={styles.title.img} alt="タイトルロゴ" src="/resources/logo.svg" />
            <Typography sx={styles.title.version}>ver.{import.meta.env.VITE_APP_VERSION}</Typography>
            <Typography sx={styles.title.text}>{title}</Typography>
        </Box>
        <Box sx={styles.container.box}>
            {children}
        </Box>
    </Box>
)
HeaderView.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node,
}

export default HeaderView