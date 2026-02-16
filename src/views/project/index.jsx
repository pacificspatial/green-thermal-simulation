import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import MapInitialView from "./mapInitial"
import {
    Backdrop,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select, TextField,
    Typography
} from "@mui/material"
import HeaderView from "@_views/header"
import { BaseButton, PageBase } from "@_views/common.jsx"
import _, { valueOr } from "ansuko"
import { Cancel as CloseIcon } from "@mui/icons-material"
import { useDialog } from "@_components/dialog.jsx"
import {
    ProjectInputField as InputField,
    ProjectInputTitle as InputTitle,
    ProjectInputBase as InputBase,
    ProjectInputBox as InputBox,
    ProjectInputBoxTitle as InputBoxTitle,
    ProjectInputBoxValue as InputBoxValue,
} from "./input"
import MapView from "./map"
import { eve, useEveListen } from "react-eve-hook"
import {
    UseApiManager, EVENT_ENTER_EDIT_POINT,
    EVENT_LEAVE_EDIT_POINT,
    EVENT_PROJECTS_UPDATE,
    EVENT_RESET_DATA,
    MainDataContext
} from "@team4am/fp-core"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        flexGrow: 1,
    },
    name: {
        box: {

        },
        label: {

        },
        input: {
            '& .MuiOutlinedInput-input': {
                background: 'white',
                borderRadius: '8px',
            },
        },
    },
    input: {
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        title: {
            fontWeight: "bold",
        },
        box: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#eee',
            borderRadius: '16px',
            padding: '16px',
            maxWidth: '300px',
        },
        windDirection: {
            minWidth: '140px',
            background: 'white',
            borderRadius: '8px',
            height: '35px',
            '& .MuiOutlinedInput-input': {
                marginTop: "3px",
            }
        }
    },
    deleteTooltip: {
        box: {
            top: '399px',
            left: '99px',
            position: 'fixed',
            zIndex: '100',
            background: '#b6b6b6',
            borderRadius: '4px',
        },
        text: {

        }
    }
}

const ProjectView = () => {

    const { state: mainState, setProject } = useContext(MainDataContext)
    const [data, setData] = useState(_.cloneDeep(_.cloneDeep(mainState.project ?? {})))
    const [loading, setLoading] = useState(false)
    const abortController = useRef()
    const edited = useMemo(() => valueOr(_.changes(
        mainState.project,
        data,
        [
            "created_at",
            "created_at_unix",
            "updated_at",
            "updated_at_unix",
            "created_user_uid",
            "process_start_at",
            "process_end_at",
            "process_status",
            "camera_position",
        ],
        { keyExcludes: true },
    )), [mainState.project, data])
    const { openConfirmIf, openAlert, openConfirm } = useDialog()
    const { PostFirst, PutFirst } = UseApiManager()
    const processButtonText = useMemo(() => {
        if (data.process_status === "processing") {
            return "シミュレーション実行中..."
        }
        if (data.process_status === "done") {
            return "シミュレーション再実行"
        }
        return "シミュレーション実行"
    }, [data.process_status])

    const onSave = useCallback(() => {

        try { abortController.current?.cancel() } catch { }

        abortController.current = new AbortController()
        setLoading(true)
        if (!data.uid) {
            PostFirst(
                "thermal_env", {
                ...data,
            },
                { signal: abortController.signal })
                .then(() => eve(EVENT_PROJECTS_UPDATE))
                .finally(() => {
                    abortController.current = null
                    setLoading(false)
                    setProject(null)
                })
        } else {
            PutFirst(
                "thermal_env",
                {
                    ...edited,
                    camera_position: data.camera_position,
                    uid: data.uid,
                },
                { signal: abortController.signal })
                .then(() => eve(EVENT_PROJECTS_UPDATE))
                .finally(() => {
                    abortController.current = null
                    setLoading(false)
                    setProject(null)
                })
        }
    }, [edited, data])

    const onChange = useCallback(val => {
        setData(prev => ({ ...prev, ...val }))
    }, [])

    const onCloseProject = useCallback(() =>
        openConfirmIf(edited, "変更は破棄されます\nよろしいですか", {
            title: "キャンセル",
            onOk: () => setProject(null),
        })
        , [edited])

    const onReset = useCallback(() => {
        setData(prev => (_.cloneDeep({
            camera_position: prev.camera_position,
            ...mainState.project
        })))
        eve(EVENT_RESET_DATA)
    }, [mainState.project])

    const onProcess = useCallback(() => {
        openConfirm("シミュレーションを実行します。\n3時間ほどかかりますよろしいですか", {
            title: "シミュレーション実行",
            onOk: () => {
                PutFirst("thermal_env/process", { uid: data.uid })
                    .then(() => {
                        eve(EVENT_PROJECTS_UPDATE)
                        setProject(null)
                    })
                    .catch(e => {
                        console.error("Error starting process:", e)
                        openAlert(e, { title: "シミュレーション実行エラー" })
                    })
            },
        })
    }, [mainState.project])

    if (!data.camera_position) {
        return <MapInitialView onChange={onChange} />
    }

    return (
        <PageBase>
            <HeaderView title="【プロジェクト設定】">
                <BaseButton disabled={edited || data?.process_status === "processing"} onClick={onProcess}>{processButtonText}</BaseButton>
                <BaseButton disabled={!edited} onClick={onSave}>変更を保存</BaseButton>
                <BaseButton disabled={!edited} onClick={onReset}>変更をリセット</BaseButton>
                <BaseButton onClick={onCloseProject}>
                    <CloseIcon />
                    {edited ? "キャンセル" : "閉じる"}
                </BaseButton>
            </HeaderView>
            <Box sx={styles.root}>
                <Box style={styles.input.root}>
                    <Box sx={styles.input.box}>
                        <Typography sx={styles.input.title}>プロジェクト名</Typography>
                        <FormControl sx={styles.name.box}>
                            <TextField
                                variant="standard"
                                sx={styles.name.input}
                                placeholder="プロジェクト名"
                                value={data?.name ?? ""}
                                onChange={e => onChange({ name: e.target.value })}
                            />
                        </FormControl>
                    </Box>
                    <Box sx={styles.input.box}>
                        <InputTitle>環境設定</InputTitle>
                        <InputBase>
                            <InputField title="気温" field="temperature" data={data} onChange={onChange} unit="°C" />
                            <InputField title="湿度" field="humidity" data={data} onChange={onChange} unit="％" />
                            <InputField title="風速" field="wind_speed" data={data} onChange={onChange} unit="m/s" />
                            <InputBox>
                                <InputBoxTitle title="風向き" />
                                <InputBoxValue>
                                    <Select
                                        sx={styles.input.windDirection}
                                        size="small"
                                        value={data?.["wind_direction"] ?? ""}
                                        onChange={e => onChange({ "wind_direction": e.target.value })}>
                                        <MenuItem value="" disabled>風向き</MenuItem>
                                        <MenuItem value={0}>北</MenuItem>
                                        <MenuItem value={90}>東</MenuItem>
                                        <MenuItem value={180}>南</MenuItem>
                                        <MenuItem value={270}>西</MenuItem>
                                    </Select>
                                </InputBoxValue>
                            </InputBox>
                        </InputBase>
                    </Box>
                    <Box sx={styles.input.box}>
                        <InputTitle>温度設定（表面）</InputTitle>
                        <InputBase>
                            <InputField title="ビル壁面温度" field="building_wall_temperature" data={data} unit="°C" onChange={onChange} />
                            <InputField title="地面温度" field="ground_temperature" data={data} unit="°C" onChange={onChange} />
                            <InputField title="道路温度" field="road_temperature" data={data} onChange={onChange} unit="°C" />
                            <InputField title="水面温度" field="water_surface_temperature" data={data} onChange={onChange} unit="°C" />
                        </InputBase>
                    </Box>
                </Box>
                <MapView data={data} onChange={onChange} />
            </Box>
            <Backdrop open={loading} sx={{ zIndex: 3 }}>
                <Box>
                    <Typography>更新中...</Typography>
                    <Button variant="outlined" onClick={() => abortController.current?.cancel()}>中止</Button>
                </Box>
            </Backdrop>
        </PageBase>
    )

}

export default ProjectView