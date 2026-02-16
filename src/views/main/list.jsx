import { DataGrid } from "@mui/x-data-grid"
import { Box, Button, IconButton } from "@mui/material"
import { Cached as ReloadIcon } from "@mui/icons-material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import { useDialog } from "@_components/dialog.jsx"
import { useEveListen } from "react-eve-hook"
import { EVENT_PROJECTS_UPDATE, MainDataContext, UseApiManager } from "@team4am/fp-core"

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "white",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        height: "100%",
    },
    inner: {
        margin: "16px",
        height: "100%",
        position: "relative",
    },
    grid: {
        width: "100%",
        maxWidth: "100%",
        '& .MuiDataGrid-root': {
            minWidth: 0,
        },
        '& .MuiDataGrid-cell': {
            cursor: 'pointer',
            userSelect: "none",
        },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
        },
        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none !important',
        },
        "& .MuiDataGrid-columnHeaders": {
            position: "sticky",
            top: 0,
            zIndex: 2,
            border: 0,
        },
        "& .MuiDataGrid-main": {
            overflow: "auto",
        },
    },
    reload: {
        button: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: '11',
        },
        icon: {

        }
    },
}

const StatusText = {
    "waiting": "処理待機中",
    "processing": "処理中",
    "done": "完了"
}

const MainListView = () => {

    const { state: mainState, setProject, setReport } = useContext(MainDataContext)
    const onDownload = useCallback(e => {
        e.stopPropagation()
        e.preventDefault()
    }, [])
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState([])
    const { GetRows } = UseApiManager()
    const { openAlert } = useDialog()

    const onOpenReport = useCallback((row) => {
        setReport(row)
        setProject(null)
    }, [setReport, setProject])

    const onOpenProject = useCallback((row) => {
        setProject(row)
        setReport(null)
    }, [setProject, setReport])

    const columns = useMemo(() => [
        { field: "uid", headerName: "UID", width: 200 },
        { field: "name", headerName: "プロジェクト名", width: 300 },
        {
            field: "created_at_unix", headerName: "登録日", width: 200, valueGetter: value => {
                if (!value) return ""
                return dayjs.unix(value).format("YYYY/MM/DD HH:mm:ss")
            }
        },
        {
            field: "updated_at_unix", headerName: "最終更新日", width: 200, valueGetter: value => {
                if (!value) return ""
                return dayjs.unix(value).format("YYYY/MM/DD HH:mm:ss")
            }
        },
        { field: "process_status", headerName: "ステータス", width: 130, valueGetter: value => StatusText[value] ?? "未実行" },
        {
            field: "open_project", headerName: "", width: 120, renderCell: params => {
                return (<Button onClick={() => onOpenProject(params.row)} size="small" variant="outlined">設定</Button>)
            }
        },
        {
            field: "open_report",
            headerName: "",
            width: 120,
            renderCell: params => {
                let disabled =
                    !params.row.temerature_ground
                    && !params.row.temperature_120
                    && !params.row.humidity_120
                    && !params.row.wbgt
                    && !params.row.cesium

                return (<Button disabled={disabled} size="small" variant="outlined" onClick={() => onOpenReport(params.row)}>結果</Button>)
            }
        },
        {
            field: "glance",
            headerName: "",
            width: 120,
            renderCell: params => {
                let disabled =
                    !params.row.temerature_ground
                    && !params.row.temperature_120
                    && !params.row.humidity_120
                    && !params.row.wbgt
                    && !params.row.cesium
                return (<Button disabled={disabled} size="small" variant="outlined" onClick={() => window.open("https://kitware.github.io/glance/app/", "_blank")}>Glance</Button>)
            },
        },
        {
            field: "download",
            headerName: "",
            width: 130,
            renderCell: params => {
                return (<Button disabled={!params.row.zip_url} size="small" variant="outlined">ダウンロード</Button>)
            }
        }
    ], [])

    const loadData = useCallback(() => {
        setLoading(true)
        GetRows("thermal_env/list")
            .then(rows => {
                setRows(rows.sort((v1, v2) => v2.updated_at_unix - v1.updated_at_unix))
            })
            .catch(e => {
                openAlert(e, { title: "読込エラー" })
            })
            .finally(() => setLoading(false))
    }, [GetRows])


    useEffect(() => {
        loadData()
    }, [])

    useEveListen(EVENT_PROJECTS_UPDATE, () => {
        setProject(null)
        loadData()
    })

    return (
        <Box style={styles.root}>
            <Box sx={styles.inner}>
                <DataGrid
                    sx={styles.grid}
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 20
                            },
                        },
                    }}
                    disableRowSelectionOnClick={true}
                    disableColumnSelector={true}
                    disableColumnMenu={true}
                />
                <IconButton sx={styles.reload.button} disabled={loading} onClick={loadData}><ReloadIcon sx={styles.reload.icon} /></IconButton>
            </Box>
        </Box>
    )
}

export default MainListView