import React, {useEffect, useRef, useState} from "react";
import {Button, TextField} from "@material-ui/core";
import '../styles/SendTemplateMessage.css';
import {getConfig, getTemplateParams, templateParamToInteger} from "../Helpers";
import FileInput from "./FileInput";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {Alert, AlertTitle} from "@material-ui/lab";

function SendTemplateMessage(props) {

    const template = props.data;

    const [params, setParams] = useState({});
    const [headerFileURL, setHeaderFileURL] = useState('');
    const [isUploading, setUploading] = useState(false);

    const headerFileInput = useRef();

    useEffect(() => {
        const preparedParams = {};
        const components = {...template.components};

        Object.entries(components).forEach((paramEntry, paramIndex) => {
            const key = paramEntry[0];
            const component = paramEntry[1];
            const componentType = component.type;

            if (componentType === "HEADER") {
                if (component.format === "IMAGE" || component.format === "VIDEO" || component.format === "DOCUMENT") {
                    const format = component.format.toLowerCase();
                    preparedParams[key] = {
                        0: { type: format }
                    };

                    preparedParams[key][0][format] = { link: "" };
                }
            }

            console.log(component.format);
            console.log(preparedParams);

            const paramText = component.text;
            const templateParamsArray = getTemplateParams(paramText);

            templateParamsArray.map((extractedParam, extractedParamIndex) => {
                if (preparedParams[key] === undefined) {
                    preparedParams[key] = {};
                }
                preparedParams[key][templateParamToInteger(extractedParam)] = {
                    type: "text",
                    text: ""
                };
            });
        });

        setParams(preparedParams);

    }, []);

    useEffect(() => {
        // Update params when header image changes
        setParams(prevState => {
            // TODO: Do this in a better way depends on template headers complexity
            if (prevState[0] && prevState[0][0] && prevState[0][0]['image']) {
                prevState[0][0]['image']['link'] = headerFileURL;
            } else if (prevState[0] && prevState[0][0] && prevState[0][0]['video']) {
                prevState[0][0]['video']['link'] = headerFileURL;
            } else if (prevState[0] && prevState[0][0] && prevState[0][0]['document']) {
                prevState[0][0]['document']['link'] = headerFileURL;
            }

            return prevState;
        });
    }, [headerFileURL, params]);

    const updateParam = (event, index, paramKey) => {
        setParams(prevState => {
            const nextState = prevState;
            nextState[index][paramKey].text = event.target.value;

            return {...nextState};
        })
    }

    const send = () => {
        const preparedParams = {};
        const components = {...template.components};

        Object.entries(components).forEach((paramEntry, paramIndex) => {
            const key = paramEntry[0];
            const component = paramEntry[1];

            if (params[key]) {
                const paramsArray = Object.values(params[key]);

                /*const localizableParams = [];
                paramsArray.forEach((paramArrayItem) => {
                    localizableParams.push({
                        "default": paramArrayItem.text
                    })
                });*/

                preparedParams[component.type] = {
                    type: component.type.toLowerCase(),
                    parameters: paramsArray,
                    //localizable_params: localizableParams
                };
            }
        });

        const finalData = template;
        finalData.params = Object.values(preparedParams);

        // TODO: Change this later
        props.send(finalData);

        /*Object.entries(params).forEach((paramEntry) => {
            finalData.components[paramEntry[0]].params = paramEntry[1];
        });*/
    }

    const handleChosenImage = (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file_encoded", file[0]);

        setUploading(true);

        axios.post(`${BASE_URL}media/`, formData, getConfig())
            .then((response) => {
                console.log(response.data);

                const fileURL = response.data.file;
                setHeaderFileURL(fileURL);

                setUploading(false);

            })
            .catch((error) => {
                // TODO: Handle errors

                setUploading(false);
            });
    }

    const getMimetypeByFormat = (format) => {
        if (format === "IMAGE") return "image/jpeg, image/png";
        if (format === "VIDEO") return "video/mp4, video/3gpp";
        if (format === "DOCUMENT") return "*/*";
    }

    return (
        <div className="sendTemplateMessage">
            <h4 className="sendTemplateMessage__title">{template.name}</h4>

            {template.components.map((comp, index) =>
                <div key={index} className="sendTemplateMessage__component">

                    <div className="sendTemplateMessage__section">
                        <h6>{comp.type}</h6>
                        <div>

                            {(comp.format === "IMAGE" || comp.format === "VIDEO" || comp.format === "DOCUMENT") &&
                            <div>
                                <div>
                                    {headerFileURL &&
                                    <div>
                                        <Alert severity="success">
                                            <AlertTitle>Uploaded successfully</AlertTitle>
                                            <a href={headerFileURL} target="_blank">{headerFileURL}</a>
                                        </Alert>

                                        {/*<img src={headerFileURL} className="sendTemplateMessage__component__header__preview" alt="Header image preview" />*/}
                                    </div>
                                    }
                                </div>
                                <FileInput innerRef={headerFileInput} multiple={false} accept={getMimetypeByFormat(comp.format)} handleSelectedFiles={handleChosenImage} />
                                <Button color="primary" onClick={() => headerFileInput.current.click()} disabled={isUploading}>Upload {headerFileURL ? "another " : ""}{comp.format.toLowerCase()}</Button>
                                {headerFileURL &&
                                <Button color="secondary" onClick={() => setHeaderFileURL('')}>Delete</Button>
                                }
                            </div>
                            }

                            {comp.text}
                            <div>
                                {getTemplateParams(comp.text).map((param, paramIndex) =>
                                    <TextField
                                        value={params[index] ? params[index][templateParamToInteger(param)].text : ''}
                                        onChange={(event) => updateParam(event, index, templateParamToInteger(param))}
                                        className="templateMessage__param"
                                        key={paramIndex}
                                        label={templateParamToInteger(param)}
                                        fullWidth={true} />
                                )}
                            </div>
                        </div>

                        {comp.type === "BUTTONS" &&
                        <div>
                            {comp.buttons.map((button, buttonIndex) =>
                                <Button key={buttonIndex} color="primary" disabled={true}>
                                    {button.text}
                                    {/*<br/>{button.type}*/}
                                </Button>
                            )}
                        </div>
                        }

                    </div>

                </div>
            )}

            <Button innerRef={props.sendButtonInnerRef} onClick={send} className="hidden">Send</Button>
        </div>
    )
}

export default SendTemplateMessage;