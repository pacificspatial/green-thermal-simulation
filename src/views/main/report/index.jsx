import { Box, Tabs, Tab, Typography, IconButton } from "@mui/material"
import { useContext, useEffect, useMemo, useState } from "react"
import { Close as CloseIcon, ArrowBack as BackIcon } from "@mui/icons-material"
import TemperatureGroundView from "./TemperatureGround"
import Temperature120View from "./Temperature120"
import Humidity120View from "./Humidity120"
import WbgtView from "./wbgt"
import CesiumView from "./cesium"
import _ from "ansuko"
import { over } from "lodash"
import { MainDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
    },
    close: {
        box: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: "0 8px",
        },
        button: {
            background: "#eee",
        }
    },
    content: {
        box: {
            position: 'relative',
            width: '100%',
            height: '100%',
        }
    }
}

const TabType = {
    TemperatureGround: "temperature_ground",
    Temperature120: "temperature_120",
    Humidity120: "humidity_120",
    Wbgt: "wbgt",
    Cesium: "cesium",
}

const MainReportView = () => {

    const { state: mainState, setReport } = useContext(MainDataContext)
    const report = useMemo(() => mainState.report, [mainState.report])

    const [tab, setTab] = useState(null)

    return (
        <Box style={styles.root}>
            <Box style={styles.close.box}>
                <IconButton onClick={() => setReport(null)} sx={styles.close.button}><BackIcon /></IconButton>
                <IconButton onClick={() => setReport(null)} sx={styles.close.button}><CloseIcon /></IconButton>
            </Box>
            <Box style={{ position: "relative", flexGrow: 1, marginTop: "8px", borderRadius: "16px", overflow: "hidden" }}>
                <SampleView data={{
                    assetAccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY",
                    assetId: 4019107,
                    latitude: 35.685000,
                    longitude: 139.75920,
                    scale: 1.5,
                    height: 5.0,
                    heading: 105,
                    pitch: 90,
                    roll: 0
                }} />
            </Box>
        </Box>
    )
}

export default MainReportView