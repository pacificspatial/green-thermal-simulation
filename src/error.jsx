import {useCallback, useEffect, useState} from "react"
import PropTypes from "prop-types";
import {Button,Typography,Box} from "@mui/material"
import StackTrace from "stacktrace-js"

const styles = {
    root: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(1deg, #a4b1ad, transparent)',
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    title: {
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#985555',
    },
    message: {
        fontSize: '12px',
        textAlign: 'center',
        color: '#d6d6d6',
        fontFamily: 'monospace',
        background: '#505050',
        padding: '8px 16px',
        boxShadow: '0px 0px 8px #333',
        margin: '1rem 0',
        whiteSpace: 'normal',
    },
    messageIdBox: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '2rem',
        background: '#ccc',
        padding: '8px',
        boxShadow: '1px 1px 8px #a4a3a3',
        borderRadius: '3px',
    },
    messageIdTitle: {
        textAlign: 'center',
        fontSize: '16px',
        color: '#666',
        fontWeight: 'bold',
    },
    messageIdLoadingBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageIdLoading: {
        width: '20px',
        height: '20px'
    },
    messageId: {
        fontFamily: 'monospace',
        fontSize: '14px',
        textAlign: 'center'
    },
    button: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
        },
    },
    fileName: {
        fontSize: '12px',
        color: 'gray',
        margin: '0 1rem',
        textAlign: 'center',
    }
}

const ErrorFallback = ({ error }) => {

    const [errorId, setErrorId] = useState()
    const [fileName, setFileName] = useState()
    const [lineNo, setLineNo] = useState()

    const getErrorId = useCallback(async () => {
        if (!error) { return }
        const stackFrames = await StackTrace.fromError(error)

        let stack = []
        stackFrames.forEach(sf => {
            const fName = sf.fileName.replace(/^https:\/\/localhost/, '')
            const lNum = sf.lineNumber
            const cNum = sf.columnNumber
            if (fName.includes("/src/")) {
                setFileName(prev => prev ?? fName.replace(/^.*src\//, ''))
                setLineNo(prev => prev ?? lNum)
            }
            stack.push(`${fName}:${lNum}:${cNum}`)
        })

    }, [error])

    useEffect(() => {
        getErrorId().then()
    }, [error])

    const onClearReload = () => {
        localStorage.clear()
        window.location.reload()
    }

    return (
        <Box style={styles.root}>
            <Box style={styles.box}>
                <Typography style={styles.title}>予期しないエラーが発生しました</Typography>
                <Typography style={styles.message}>{error.message ?? "不明"}</Typography>
                <Box style={styles.button.box}>
                    <Button variant="outlined" onClick={() => window.location?.reload()}>再読み込み</Button>
                    <Button variant="outlined" onClick={onClearReload}>設定クリア&再読み込み</Button>
                </Box>
                {fileName && (
                    <div style={styles.fileName}>{fileName}:{lineNo ?? "--"}</div>
                )}
            </Box>
        </Box>
    )

}

ErrorFallback.propTypes = {
    error: PropTypes.any,
    info: PropTypes.any,
}

export default ErrorFallback
