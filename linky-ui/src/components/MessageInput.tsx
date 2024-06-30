import {CompoundButton, Field, makeStyles, Textarea} from "@fluentui/react-components";
import {
    bundleIcon,
    ArrowCircleUp32Filled,
    ArrowCircleUp32Regular,
} from "@fluentui/react-icons";
import {useState} from "react";

const ArrowSend = bundleIcon(ArrowCircleUp32Filled, ArrowCircleUp32Regular);

const useStyles = makeStyles({
    root: {
        paddingLeft: '8px',
        paddingRight: '8px',
        display: 'grid',
        gridTemplateColumns: "90% auto"
    },
    actionContainer: {
        display: "flex",
        justifyContent: "space-evenly",
    }
})

type MessageInputProps = {
    onSubmit: (input: string) => void,
    disabled: boolean
}

export function MessageInput({onSubmit, disabled}: MessageInputProps) {
    const classes = useStyles();
    const [input, setInput] = useState<string>("")

    function handleSubmitButton() {
        onSubmit(input);
        setInput("");
    }

    return (
        <div className={classes.root}>
            <Field>
                <Textarea disabled={disabled} value={input} onChange={(_, data) => setInput(data.value)} placeholder="Ask me anything ..."/>
            </Field>
            <div className={classes.actionContainer} color="green">
                <CompoundButton disabled={disabled || !input || input.length === 0} icon={<ArrowSend/>}
                                onClick={handleSubmitButton}>Submit</CompoundButton>
            </div>
        </div>
    )
}