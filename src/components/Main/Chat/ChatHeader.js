import React, {useEffect, useState} from 'react';
import '../../../styles/ChatHeader.css';
import {Avatar, IconButton, Menu, MenuItem} from "@material-ui/core";
import {ArrowBack, MoreVert, Search} from "@material-ui/icons";
import {avatarStyles} from "../../../AvatarStyles";
import {EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY} from "../../../Constants";
import PubSub from "pubsub-js";
import {useHistory} from "react-router-dom";
import {addPlus, extractAvatarFromContactProviderData, replaceEmojis} from "../../../helpers/Helpers";

function ChatHeader(props) {

    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();

    useEffect(() => {

    }, []);

    const displayMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const hideMenu = () => {
        setAnchorEl(null);
    }

    const avatarClasses = avatarStyles();

    const showSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, true);
    }

    const showContactDetails = () => {
        PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, true);
    }

    const showContactDetailsAndHideMenu = () => {
        showContactDetails();
        hideMenu();
    }

    const showChatAssignmentAndHideMenu = () => {
        props.setChatAssignmentVisible(true);
        hideMenu();
    }

    const showChatTagsAndHideMenu = () => {
        props.setChatTagsVisible(true);
        hideMenu();
    }

    return (
        <div className="chat__header" onDrop={(event) => event.preventDefault()}>

            {!props.isChatOnly &&
            <div className="mobileOnly">
                <IconButton className="chat__header__backButton" onClick={props.closeChat}>
                    <ArrowBack/>
                </IconButton>
            </div>
            }

            <div className="chat__header__clickable" onClick={showContactDetails}>
                <Avatar
                    src={extractAvatarFromContactProviderData(props.contactProvidersData[props.person?.waId])}
                    className={(props.person?.isExpired ? '' : avatarClasses[props.person?.getAvatarClassName()]) + (" chat__header__avatar")}>{props.person?.initials}</Avatar>

                <div className="chat__headerInfo">
                    <h3 dangerouslySetInnerHTML={{__html: replaceEmojis((props.contactProvidersData[props.person?.waId]?.[0]?.name ?? props.person?.name) ?? (props.person?.waId ? addPlus(props.person?.waId) : ''))}} />

                    {/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}

                    {props.person?.isExpired &&
                    <p className="chat__header__expired">Inactive</p>
                    }
                </div>

                <div className="chat__headerInfo_2">
                <span className="chat__headerInfo_2__waId desktopOnly">
                    {props.person?.waId ? addPlus(props.person?.waId) : ''}
                </span>
                </div>
            </div>

            <div className="chat__headerRight">
                <IconButton onClick={showSearchMessages}>
                    <Search />
                </IconButton>
                <IconButton onClick={displayMenu}>
                    <MoreVert />
                </IconButton>
            </div>

            <Menu
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={hideMenu}
                elevation={3}>
                <MenuItem onClick={showContactDetailsAndHideMenu}>Contact details</MenuItem>
                <MenuItem onClick={showChatAssignmentAndHideMenu}>Assign chat</MenuItem>
                <MenuItem onClick={showChatTagsAndHideMenu}>Change tags</MenuItem>
            </Menu>

        </div>
    )
}

export default ChatHeader;