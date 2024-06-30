import {makeStyles, Text} from "@fluentui/react-components";
import {Message} from '@xenova/transformers'
import {BookContactsRegular, DesktopMacRegular} from "@fluentui/react-icons";
import DOMPurify from 'dompurify'
import {marked} from "marked";

const useStyles = makeStyles({
    root: {
        paddingLeft: '8px',
        paddingRight: '8px',
        overflowY: "auto"
    },
    cardRoot: {
        paddingTop: '8px',
        paddingLeft: '16px',
        display: 'grid',
        gridTemplateColumns: "5% auto"
    },
    cardMessage: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        wordWrap: "break-word",
        flexShrink: "unset !important",
    },
    cardRole: {
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        justifyContent: "left"
    }
})

type MessageHolderProps = {
    messages: Message[]
}

export function MessageHolder({messages}: MessageHolderProps) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {
                messages.slice(1).map((message, idx) =>
                    <div key={idx} className={classes.cardRoot}>
                        <div className={classes.cardRole}>
                            {message.role === 'user' ? <BookContactsRegular/> : <DesktopMacRegular/>} <Text weight="semibold">{message.role}</Text>
                        </div>
                        <div className={classes.cardMessage}>
                            <span
                                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked.parse(message.content) as string)}}></span>
                        </div>
                    </div>
                )
            }
        </div>
    )
}