import React, {useEffect, useState} from "react";
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";

function ChatTags(props) {

    const [chat, setChat] = useState();
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        retrieveChat();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <div>You can add or remove tags for this chat</div>

                {chat?.tags &&
                <div>
                    <h5>Current tags</h5>
                    {chat.tags.map((tag) =>
                        <Chip label={tag.name} />
                    )}
                </div>
                }

                {allTags &&
                <div>
                    <h5>All tags</h5>
                    {allTags.map((tag) =>
                        <Chip label={tag.name} />
                    )}
                </div>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatTags;