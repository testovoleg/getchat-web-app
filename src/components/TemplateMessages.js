import React, {useEffect, useRef, useState} from "react";
import {Button} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import SendTemplateMessage from "./SendTemplateMessage";
import {EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, EVENT_TOPIC_SENT_TEMPLATE_MESSAGE} from "../Constants";
import PubSub from "pubsub-js";
import {getObjLength} from "../Helpers";

function TemplateMessages(props) {

    const templates = props.templatesData;

    const [chosenTemplate, setChosenTemplate] = useState();
    const [isDialogVisible, setDialogVisible] = useState(false);

    const dialogContent = useRef();

    const [isSending, setSending] = useState(false);
    const [errors, setErrors] = useState();

    const sendButtonRef = useRef();

    useEffect(() => {
        setDialogVisible(false);
    }, [props.waId]);

    const showDialog = () => {
        setErrors(undefined);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setErrors(undefined);
        setDialogVisible(false);
    };

    const chooseTemplate = (template) => {
        setChosenTemplate(template);
        showDialog();
    }

    const send = (template) => {
        props.onSend(template ?? chosenTemplate);
        //hideDialog();
    }

    const sendByRef = () => {
        setSending(true);
        sendButtonRef.current?.click();
    }

    useEffect(() => {
        const onSendTemplateMessageError = function (msg, data) {
            setErrors(data);
            setSending(false);

            // Scroll to bottom
            if (dialogContent) {
                dialogContent.current.scrollTop = dialogContent.current.scrollHeight;
            }
        }

        const sendTemplateMessageErrorEventToken = PubSub.subscribe(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, onSendTemplateMessageError);

        const onSentTemplateMessage = function (msg, data) {
            hideDialog();
            setSending(false);
        }

        const sentTemplateMessageEventToken = PubSub.subscribe(EVENT_TOPIC_SENT_TEMPLATE_MESSAGE, onSentTemplateMessage);

        return () => {
            PubSub.unsubscribe(sendTemplateMessageErrorEventToken);
            PubSub.unsubscribe(sentTemplateMessageEventToken);
        }
    }, [dialogContent]);

    return (
        <div className="templateMessagesOuter">
            {/*<SearchBar />*/}

            {props.isLoadingTemplates
                ?
                <Alert severity="info">Loading template messages...</Alert>
                :
                <div className="templateMessages">

                    {getObjLength(templates) === 0 &&
                    <div>No template messages have been registered yet.</div>
                    }

                    {Object.entries(templates).map((template, index) =>
                        <div key={template[0]} className="templateMessageWrapper">

                            <div className="chat__templateMsg chat__message chat__outgoing">
                                {/*<span className={"templateMessage__status " + template[1].status}>{template[1].status}</span>*/}
                                <div className="templateMessage__message">
                                    {template[1].components.map((comp, index) =>
                                        <div key={index}>
                                            <span className="templateType bold lowercase">{comp.type}:</span> {comp.text ?? comp.format ?? JSON.stringify(comp.buttons)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {template[1].status === "approved" &&
                            <Button onClick={() => chooseTemplate(template[1]) /*props.onSend(template[1])*/}>Send</Button>
                            }

                        </div>
                    )}

                </div>
            }

            <Dialog
                open={isDialogVisible}
                onClose={hideDialog}>
                <DialogTitle>{"Send a template message"}</DialogTitle>
                <DialogContent ref={dialogContent}>
                    <SendTemplateMessage
                        data={chosenTemplate}
                        send={(template) => send(template)}
                        sendButtonInnerRef={sendButtonRef} />

                    {errors &&
                    <div className="templateMessagesDialogErrors">
                        {errors.map((err, index) =>
                            <Alert key={index} severity="error">
                                <AlertTitle>{err.title}</AlertTitle>
                                {err.details}
                            </Alert>
                        )}
                    </div>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={hideDialog} color="secondary">Close</Button>
                    <Button onClick={sendByRef} color="primary" disabled={isSending} autoFocus>Send</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default TemplateMessages;