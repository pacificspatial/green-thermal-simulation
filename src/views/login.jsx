import {
    Backdrop,
    Box,
    Button, CircularProgress,
    Dialog, DialogActions, DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    OutlinedInput
} from "@mui/material";
import { useCallback, useState } from "react";
import { useDialog } from "@_components/dialog.jsx";
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth"
import { UseApiManager } from "@team4am/fp-core"

const styles = {
    root: {
        display: 'flex',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "column",
    },
    inputBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '1rem',
    },
    input: {
        width: "250px",
    },
    loginButton: {
        width: "150px",
        background: `#${import.meta.env.VITE_DEFAULT_PRIMARY_COLOR}`,
    },
    forgotPassword: {
        margin: "2rem",
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    }
}

const LoginView = () => {

    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [openForgotPassword, setOpenForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState()
    const { openAlert } = useDialog()
    const { PostOne } = UseApiManager()
    const [loading, setLoading] = useState(false)
    const auth = getAuth()

    const onLogin = useCallback(() => {
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then(() => setLoading(false))
            .catch(e => {
                console.error(e.value)
            })
            .finally(() => setLoading(false))
    }, [email, password])

    const sendForgotEmail = useCallback(async () => {
        setOpenForgotPassword(false)
        setLoading(true)
        try {
            await sendPasswordResetEmail(auth, forgotEmail)
            openAlert("再設定用のメールを送信しました")
        } catch (e) {
            openAlert(`送信に失敗しました\n${e}`)
        } finally {
            setLoading(false)
        }
    }, [forgotEmail])

    return (
        <Box style={styles.root}>
            <Box style={styles.inputBox}>
                <FormControl size="small">
                    <InputLabel style={{ background: `white`, }}>メールアドレス</InputLabel>
                    <OutlinedInput value={email} style={styles.input} onChange={e => setEmail(e.target.value)} />
                </FormControl>
                <FormControl size="small">
                    <InputLabel style={{ background: `white` }}>パスワード</InputLabel>
                    <OutlinedInput value={password} style={styles.input} type="password" onChange={e => setPassword(e.target.value)} />
                </FormControl>
            </Box>

            <Button onClick={onLogin} style={styles.loginButton} variant="contained">ログイン</Button>
            <Button onClick={() => setOpenForgotPassword(true)} style={styles.forgotPassword}>パスワードを忘れたら</Button>
            <Dialog open={openForgotPassword}>
                <DialogTitle>パスワードの再発行</DialogTitle>
                <DialogContent style={{ display: "flex", flexDirection: "column" }}>
                    <DialogContentText>パスワードを再発行します、登録メールアドレスを入力してください</DialogContentText>
                    <Box style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                        <FormControl size="small">
                            <InputLabel style={{ background: "white" }}>登録メールアドレス</InputLabel>
                            <OutlinedInput style={{ width: "250px" }} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={sendForgotEmail}>メール送信</Button>
                    <Button onClick={() => {
                        setOpenForgotPassword(false)
                        setForgotEmail(null)
                    }}>キャンセル</Button>
                </DialogActions>
            </Dialog>
            <Backdrop open={loading} style={styles.loading}>
                <CircularProgress />
            </Backdrop>
        </Box>
    )
}

export default LoginView