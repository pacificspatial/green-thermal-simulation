import { Box, CircularProgress, Typography, FormControlLabel, Checkbox, Button } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import _ from "ansuko"
import { useDialog } from "@_components/dialog.jsx"
import { getAuth } from "firebase/auth"
import { AUTH_DISABLE_CODE_LOCAL_STORAGE_KEY } from "../App.jsx"
import { UseApiManager, AppDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#e0e0e0',
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
    },
    label: {
        fontSize: '23px',
        fontWeight: 'bold',
    },
    digits: {
        root: {
            display: 'flex',
            flexDirection: 'row',
            gap: '16px'
        },
        box: {
            width: '64px',
            height: '80px',
            border: '1px solid #000',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: "center",
            alignItems: "center",
        },
        input: {
            fontSize: "48px",
        },
    },
    resend: {
        box: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '16px',
        },
        button: {
            fontSize: "16px",
        }
    }
}

const digits = 5

const AuthView = () => {

    const lastIndex = useMemo(() => 5 - 1, [])

    const { state: appState, setUser } = useContext(AppDataContext)
    const [code, setCode] = useState(Array(digits).fill(""))
    const [currentIndex, setCurrentIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState(null)
    const { PostOne, GetOne } = UseApiManager()
    const { openAlert } = useDialog()
    const [loading, setLoading] = useState(false)
    const [noCode, setNoCode] = useState(false)
    const mail = useMemo(() => {
        if (!appState.user?.email) { return "不明" }
        const val = appState.user.email.split('@')
        return [val[0].slice(0, 3) + '***', val[1].slice(0, 5) + '***'].join('@')
    }, [appState.user?.email])

    const checkVerify = useMemo(() => _.debounce(() => {
        if (!appState.user) { return }
        setLoading(true)
        PostOne("auth/verify_code", { code: code.join("") })
            .then(res => {
                if (res) {
                    if (noCode) {
                        let value
                        const nData = localStorage.getItem(AUTH_DISABLE_CODE_LOCAL_STORAGE_KEY)
                        if (nData) {
                            const val = JSON.parse(nData)
                            value.disabled = [...val.disabled, appState.user.email]
                        } else {
                            value = { disabled: [appState.user.email] }
                        }
                        localStorage.setItem(AUTH_DISABLE_CODE_LOCAL_STORAGE_KEY, JSON.stringify(value))
                    }
                    setUser({ ..._.cloneDeep(appState.user), require_auth: false })
                }
                else {
                    setErrorMessage("認証コードが一致していません")
                }
            })
            .catch(e => {
                if (e.status === 404) {
                    openAlert("ユーザが存在しないか、みつかりません\nログアウトします", {
                        onConfirm: () => getAuth().signOut().then(() => window.location.reload())
                    })
                }
                console.error(e)
            })
            .finally(() => setLoading(false))
    }, 100), [code, appState.user, setUser])

    const reSendSMS = useCallback(() => {
        setLoading(true)
        GetOne("auth/check_verify")
            .then(res => {
                setUser({ ..._.cloneDeep(appState.user), require_auth: res })
            })
            .finally(() => {
                setLoading(false)
            })
    }, [PostOne])

    const onKeyUp = useMemo(() => _.debounce(e => {
        if (currentIndex > lastIndex) {
            return
        }
        if (e.key >= "0" && e.key <= "9") {
            setCode(prev => {
                prev[currentIndex] = e.key
                return [...prev]
            })
            if (currentIndex < lastIndex) {
                setCurrentIndex(prev => prev + 1)
            }
        } else if (e.key === "Backspace") {
            setCode(prev => {
                prev[currentIndex] = ""
                return [...prev]
            })
            if (currentIndex <= 0) {
                setCurrentIndex(0)
            } else {
                setCurrentIndex(prev => prev - 1)
            }
        } else if (e.key === "ArrowRight") {
            if (currentIndex >= lastIndex) {
                return
            }
            setCurrentIndex(prev => prev + 1)
        } else if (e.key === "ArrowLeft") {
            if (currentIndex <= 0) {
                return
            }
            setCurrentIndex(prev => prev - 1)
        } else {
        }
    }, 100), [currentIndex, code])

    const onLogout = useCallback(() => {
        getAuth().signOut().then(() => window.location.reload())
    }, [])

    const onChangeNoCode = useCallback((e, v) => {
        setNoCode(v)
    }, [])

    useEffect(() => {
        setErrorMessage(null)
        if (_.isNil(code.find(_.isEmpty))) {
            checkVerify()
        }
    }, [code]);

    useEffect(() => {
        document.addEventListener("keyup", onKeyUp)
        return () => {
            document.removeEventListener("keyup", onKeyUp)
        }
    }, [onKeyUp])

    return (
        <Box style={styles.root} onKeyUp={onKeyUp}>
            <Box style={styles.box}>
                <Typography style={styles.label}>SMSに送信された認証コードを入力してください</Typography>
                <Box style={styles.digits.root}>
                    {code.map((item, index) => (
                        <Box onClick={() => setCurrentIndex(index)} style={{ ...styles.digits.box, background: currentIndex === index ? "#eee" : null }} key={`digit-box-${index}`}>
                            <Typography style={{ ...styles.digits.input, ...(currentIndex === index ? styles.digits.current : null) }}>{item}</Typography>
                        </Box>
                    ))}
                </Box>
                <Box>
                    <FormControlLabel control={<Checkbox checked={noCode} onChange={onChangeNoCode} />} label="このブラウザではコードを要求しないでください" />
                </Box>
                {!loading ? <Typography style={{ color: "#f33" }}>{errorMessage ?? " "}</Typography> : null}
                {loading ? <CircularProgress /> : null}
                <Box style={styles.resend.box}>
                    <Button style={styles.resend.button} onClick={reSendSMS}>SMS再送信</Button>
                </Box>
                <Box>
                    <Typography>{mail}でログイン中</Typography>
                    <Button onClick={onLogout}>別のユーザに切替</Button>
                </Box>
            </Box>
        </Box>
    )
}

export default AuthView