import { useCallback, useContext, useState, useRef } from "react"
import { Box, Typography, Button, Backdrop, CircularProgress, Grow } from "@mui/material"
import _ from "ansuko"
import dayjs from "dayjs"
import { getAuth } from "firebase/auth"
import { Workbook } from "exceljs"
import HeaderView from "@_views/header"
import { useDialog } from "@_components/dialog.jsx"
import { ExitToApp as LogoutIcon } from "@mui/icons-material"
import { BaseButton, baseGradient } from "@_views/common.jsx"
import ProjectView from "@_views/project"
import ListView from "./list"
import ReportView from "./report"
import { UseApiManager, MainDataProvider, AppDataContext, MainDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: baseGradient,
        padding: "16px 32px",
        gap: "1rem",
        position: 'relative',
    },
    box: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        overflow: 'clip',
    },
    excelProgress: {
        width: "300px",
        height: "200px",
        background: "white",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
    },
    report: {

    },
}

const MainViewComponent = () => {

    const { GetRows } = UseApiManager()
    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setProject, setReport } = useContext(MainDataContext)
    const abortControllerRef = useRef()
    const [excelExporting, setExcelExporting] = useState(false)
    const { openConfirm } = useDialog()

    const onExcelExport = useCallback(async () => {
        setExcelExporting(true)
        if (abortControllerRef.current) {
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        const rows = await GetRows("green_infra/export_data", {
        }, {
            signal: abortControllerRef.current.signal,
        })
        if (!abortControllerRef.current) {
            return
        }

        const border = {
            top: { style: 'thin', color: { argb: 'FF333333' } },
            left: { style: 'thin', color: { argb: 'FF333333' } },
            bottom: { style: 'thin', color: { argb: 'FF333333' } },
            right: { style: 'thin', color: { argb: 'FF333333' } },
        }
        const nameCount = {}
        const workbook = new Workbook()
        for (const row of rows) {
            let name = row.name ?? "名称未設定"
            if (_.has(nameCount, name)) {
                nameCount[name]++
                name = `${name}(${nameCount[name]})`
            } else {
                nameCount[name] = 0
            }
            const sheet = workbook.addWorksheet(name)
            sheet.getCell(1, 1).value = "CO2吸収量（kg-CO2/年）/敷地面積（m2）＝｛樹木 1 本当たりの年間生体バイオマス成長量（t-C/本/年）×高木の本数（本）×（44/12）｝×1000÷敷地面積（m2）"

            sheet.getCell(3, 1).value = "敷地面積"
            sheet.getCell(3, 1).border = border
            sheet.getCell(3, 2).value = row.site_area ?? row.calced_site_area
            sheet.getCell(3, 2).border = border
            sheet.getCell(4, 1).value = "CO2吸収量（kg-CO2/年）/敷地面積（m2）"
            sheet.getCell(4, 1).border = border
            sheet.getCell(4, 2).value = row.co2_absorption ?? row.calced_co2_absorption
            sheet.getCell(4, 2).border = border

            sheet.getCell(7, 1).value = "樹種名"
            sheet.getCell(7, 1).border = border
            sheet.getCell(7, 2).value = "年間生体バイオマス成長量（t-C/本/年）"
            sheet.getCell(7, 2).border = border
            sheet.getCell(7, 3).value = "本数"
            sheet.getCell(7, 3).border = border
            sheet.getCell(7, 4).value = "CO2 吸収量（kg-CO2/年）"
            sheet.getCell(7, 4).border = border

            for (let i = 0; i < _.size(row.trees); i++) {
                const tree = row.trees[i]
                sheet.getCell(8 + i, 1).value = tree.name
                sheet.getCell(8 + i, 1).border = border
                sheet.getCell(8 + i, 2).value = tree.growth_annual
                sheet.getCell(8 + i, 2).border = border
                sheet.getCell(8 + i, 3).value = tree.count
                sheet.getCell(8 + i, 3).border = border
                sheet.getCell(8 + i, 4).value = tree.co2_absorption
                sheet.getCell(8 + i, 4).border = border
            }
            sheet.getColumn(1).width = 40
            sheet.getColumn(2).width = 40
            sheet.getColumn(3).width = 8
            sheet.getColumn(4).width = 25
        }


        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `緑の指標 全プロジェクトエクスポート-${dayjs.tz().format("YYYY-MM-DD")}.xlsx`
        if (!abortControllerRef.current) {
            return
        }
        link.click()

        _.waited(() => {
            window.URL.revokeObjectURL(url)
            setExcelExporting(false)
        }, 1)
    }, [appState.env])

    const onExportCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setExcelExporting(false)
    }, [])

    const onLogout = useCallback(() => {
        openConfirm("本当にログアウトしますか", {
            onOk: () => {
                getAuth().signOut().then()
            }
        })
    }, [])


    if (mainState.project) {
        return <ProjectView />
    }

    return (
        <Box style={styles.root}>
            <HeaderView title="【算出】">
                <BaseButton onClick={() => setProject({})}>新規プロジェクト</BaseButton>
                <BaseButton icon={<LogoutIcon />} onClick={onLogout}>
                    <LogoutIcon />
                    ログアウト
                </BaseButton>
            </HeaderView>
            <Box sx={{ display: "flex", flexDirection: "row", width: "calc(100vw - 64px)", height: "100%", position: "relative", gap: "8px" }}>
                <Box sx={{ width: mainState.report ? "calc(50% - 16px)" : "100%" }}><ListView /></Box>
                {mainState.report && (<Box sx={{ flexGrow: 1, padding: "8px", borderRadius: "16px", background: "white" }}><ReportView /></Box>)}
            </Box>
            <Backdrop open={excelExporting} style={{ zIndex: 3 }}>
                <Box style={styles.excelProgress}>
                    <Typography>Excelエクスポート中</Typography>
                    <CircularProgress />
                    <Button variant="outlined" onClick={onExportCancel}>キャンセル</Button>
                </Box>
            </Backdrop>
        </Box>
    )
}

const MainView = () => (
    <MainDataProvider>
        <MainViewComponent />
    </MainDataProvider>
)

export default MainView