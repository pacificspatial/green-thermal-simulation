import React, { useReducer, createContext, useContext, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField, Box, Typography,
} from '@mui/material';
import PropTypes from "prop-types";
import _ from "ansuko";
import {
    baseGradient,
    cancelButtonGradient,
    hoverCancelButtonGradient,
    hoverOkButtonGradient,
    okButtonGradient
} from "@_views/common"

const ActionType = {
    SetConfirm: "SET_CONFIRM",
    SetModal: "SET_MODAL",
    SetAlert: "SET_ALERT",
    SetInput: "SET_INPUT",
    Close: "CLOSE",
};

const initialState = {
    open: false,
    type: null,
    title: '',
    message: '',
    onOk: null,
    onConfirm: null,
    onCancel: null,
    inputValue: '',
    inputLabel: '',
    autoClose: true,
};

const DialogReducer = (state, action) => {
    switch (action.type) {
        case ActionType.SetConfirm:
            return {
                ...state,
                open: true,
                type: 'confirm',
                title: action.payload.title || '確認',
                message: action.payload.message,
                onConfirm: action.payload.onConfirm ?? action.payload.onOk,
                onCancel: action.payload.onCancel,
                autoClose: action.payload.autoClose ?? true,
            };

        case ActionType.SetModal:
            return {
                ...state,
                open: true,
                type: 'modal',
                title: action.payload.title || '確認',
                message: action.payload.message,
                onConfirm: action.payload.onOk,
                onCancel: action.payload.onCancel,
                autoClose: action.payload.autoClose ?? true,
            };

        case ActionType.SetAlert:
            return {
                ...state,
                open: true,
                type: 'alert',
                title: action.payload.title || 'お知らせ',
                message: action.payload.message,
                onConfirm: action.payload.onOk,
                autoClose: action.payload.autoClose ?? true,
            };

        case ActionType.SetInput:
            return {
                ...state,
                open: true,
                type: 'input',
                title: action.payload.title || '入力',
                message: action.payload.message,
                inputValue: action.payload.defaultValue || '',
                inputLabel: action.payload.inputLabel || '入力してください',
                onConfirm: action.payload.onOk,
                onCancel: action.payload.onCancel,
                autoClose: action.payload.autoClose ?? true,
            };

        case ActionType.Close:
            return {
                ...initialState,
            };

        default:
            return state;
    }
};


const DialogContext = createContext();

const styles = {
    root: {
        '& .MuiDialog-paper': {
            borderRadius: "16px",
            background: baseGradient,
        },
    },
    title: {
        color: "white",
        fontWeight: "bold",
    },
    content: {
        box: {},
        textBox: {
            padding: '16px',
            borderRadius: '8px',
            background: '#d8d8d8',
            boxShadow: 'rgb(0, 0, 0) 2px 2px 3px inset',
        },
        text: {

        },
        input: {},
    },
    actions: {
        button: { minWidth: "100px", borderRadius: "16px", },
        cancel: {
            background: cancelButtonGradient,
            '&:hover': {
                background: hoverCancelButtonGradient,
            }
        },
        ok: {
            background: okButtonGradient,
            '&:hover': {
                background: hoverOkButtonGradient,
            }
        }
    }
}


export const DialogProvider = ({ children }) => {
    const [state, dispatch] = useReducer(DialogReducer, initialState);


    const openConfirm = useCallback((message, options) => {
        dispatch({
            type: ActionType.SetConfirm,
            payload: {
                message,
                ...options
            },
        })
    }, [])

    const openModal = useCallback((message, options) => {
        dispatch({
            type: ActionType.SetModal,
            payload: {
                message,
                ...options
            },
        })
    }, [])

    const openAlert = useCallback((message, options) => {
        dispatch({
            type: ActionType.SetAlert,
            payload: {
                message,
                ...options
            },
        })
    }, [])

    const openConfirmIf = useCallback((condition, message, options) => {
        if (typeof condition === "function") {
            condition = condition()
        } else if (condition instanceof Promise) {
            return condition.then(res => {
                if (res) {
                    openConfirm(message, options)
                } else {
                    options?.onOk?.()
                }
            })
        }
        if (condition) {
            openConfirm(message, options)
        } else {
            options?.onOk?.()
        }
    }, [])

    const openDialog = openAlert

    const openInput = useCallback((message, options) => {
        dispatch({
            type: ActionType.SetInput,
            payload: {
                message,
                ...options
            },
        })
    }, [])

    const closeDialog = useCallback(() => {
        dispatch({ type: ActionType.Close })
    }, [])


    const handleConfirm = useCallback(() => {
        let f = null
        if (state.onConfirm) {
            if (state.type === "input") {
                f = state.onConfirm(state.inputValue)
            } else {
                f = state.onConfirm()
            }
        }
        if (_.isNil(f)) {
            state.autoClose && closeDialog()
        } else {
            Promise.resolve(f)
                .then(close => {
                    if (close || state.autoClose) {
                        closeDialog()
                    }
                })
        }
    }, [closeDialog, state.type, state.onConfirm, state.autoClose, state.inputValue])

    const handleCancel = useCallback(() => {
        let f = null
        if (state.onCancel) {
            f = state.onCancel()
        }
        if (_.isNil(f)) {
            state.autoClose && closeDialog()
        } else {
            Promise.resolve(f)
                .then(close => {
                    if (close || state.autoClose) {
                        closeDialog()
                    }
                })
        }
    }, [state.onCancel, state.autoClose, closeDialog])

    const handleInputChange = useCallback((e) => {
        dispatch({
            type: ActionType.SetInput,
            payload: {
                ...state,
                inputValue: e.target.value,
            },
        });
    }, [state])

    const contextValue = {
        openConfirm,
        openDialog,
        openModal,
        openAlert,
        openInput,
        closeDialog,
        openConfirmIf,
    };

    return (
        <DialogContext.Provider value={contextValue}>
            {children}

            <Dialog
                open={state.open}
                onClose={state.type === 'alert' ? handleConfirm : handleCancel}
                maxWidth="sm"
                fullWidth
                sx={styles.root}
            >
                <DialogTitle sx={styles.title}>{state.title}</DialogTitle>

                <DialogContent sx={styles.content.box}>
                    {state.message && (
                        React.isValidElement(state.message) ?
                            state.message :
                            (
                                <Box style={styles.content.textBox}>
                                    <Typography style={{ ...styles.content.text, whiteSpace: "pre-line" }}>{String(state.message)}</Typography>
                                </Box>
                            )
                    )}

                    {state.type === 'input' && (
                        <TextField
                            sx={styles.content.input}
                            autoFocus
                            margin="dense"
                            label={state.inputLabel}
                            fullWidth
                            variant="outlined"
                            value={state.inputValue}
                            onChange={handleInputChange}
                        />
                    )}
                </DialogContent>

                <DialogActions sx={styles.actions.box}>
                    {state.type === 'confirm' && (
                        <>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.cancel }} onClick={handleCancel} variant="contained">いいえ</Button>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.ok }} onClick={handleConfirm} variant="contained">
                                はい
                            </Button>
                        </>
                    )}

                    {state.type === 'modal' && (
                        <>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.cancel }} onClick={handleCancel} variant="contained">Cancel</Button>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.ok }} onClick={handleConfirm} variant="contained">
                                OK
                            </Button>
                        </>
                    )}

                    {state.type === 'alert' && (
                        <Button sx={{ ...styles.actions.button, ...styles.actions.ok }} onClick={handleConfirm} variant="contained">
                            OK
                        </Button>
                    )}

                    {state.type === 'input' && (
                        <>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.cancel }} onClick={handleCancel} variant="contained">キャンセル</Button>
                            <Button sx={{ ...styles.actions.button, ...styles.actions.ok }} onClick={handleConfirm} variant="contained">
                                OK
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </DialogContext.Provider>
    );
};
DialogProvider.propTypes = {
    children: PropTypes.node.isRequired,
}



export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};