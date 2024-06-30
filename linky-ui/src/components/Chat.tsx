import {MessageHolder} from "./MessageHolder.tsx";
import {
    Link,
    makeStyles,
    Toast,
    Toaster, ToastIntent, ToastPosition,
    ToastTitle,
    ToastTrigger,
    useId,
    useToastController
} from "@fluentui/react-components";
import {MessageInput} from "./MessageInput.tsx";
import {useEffect, useRef, useState} from "react";
import {Text} from '@fluentui/react-components'
import {Message} from "@xenova/transformers";
import {FileProgressIndicator, LLMWorkerResponse} from "../workers/types/LLMWorkerResponse.ts";
import {LLMGenerateArgs, LLMInitArgs} from "../workers/types/LLMWorkerArgs.ts";
import FileProgressBar from "./FileProgressBar.tsx";

const useStyles = makeStyles({
    container: {
        display: 'grid',
        gridTemplateRows: '90% auto auto',
        height: "95%",
        maxHeight: '95%',
    },
})

enum SLMState {
    INITIALIZING,
    GENERATING,
    READY
}

export function Chat() {
    const classes = useStyles();
    const [messages, setMessages] = useState<Message[]>([{
        role: "system",
        content: "You are jarvis a powerful and helpful assistant. Be precise, respectful and answer user queries promptly.",
    }]);
    const [tps, setTps] = useState<number>(0);
    const [slmState, setSlmState] = useState<SLMState>(SLMState.INITIALIZING);
    const [fileProgressIndicators, setFileProgressIndicators] = useState<FileProgressIndicator[]>([]);

    const worker = useRef<Worker | null>(null);
    const model_id = 'Xenova/Phi-3-mini-4k-instruct_fp16'
    const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
    const toasterId = useId("toaster");
    const toastId = useId("toast")
    const {dispatchToast} = useToastController(toasterId)


    function onMessage(event: MessageEvent<LLMWorkerResponse>) {
        const response = event.data;
        if (response.type === 'streaming_message') {
            setMessages(prevMessages => {
                const messages = [...prevMessages]
                const lastMessage = {...messages[prevMessages.length - 1]}
                if (lastMessage.role === 'assistant') {
                    lastMessage.content += response.content;
                    messages[messages.length - 1] = lastMessage
                } else {
                    messages.push({role: 'assistant', content: response.content} as Message)
                }
                setTps(response.tokensPerSecond)
                return messages
            })
        }

        if (response.type == 'update') {
            if (response.content === 'ready') {
                setSlmState(SLMState.READY);
                notify('SLM is loaded!', 'success')
            }
            if (response.content === 'generation_done') {
                setSlmState(SLMState.READY)
            }
        }

        if (response.type === 'download_update') {
            setFileProgressIndicators(prevIndicators => {
                let clonedIndicators = [...prevIndicators];
                const updatedIndicator = {...response.progressIndicator}
                const existingIndicatorIdx = clonedIndicators.findIndex(indicator => indicator.file === updatedIndicator.file);
                if (updatedIndicator.status === 'progress') {
                    if (existingIndicatorIdx != -1) {
                        clonedIndicators[existingIndicatorIdx] = updatedIndicator;
                    } else {
                        clonedIndicators = [...clonedIndicators, updatedIndicator]
                    }
                }
                return clonedIndicators;
            })
        }
    }

    const notify = (message: string, intent: ToastIntent = "info", timeout = 3000, position: ToastPosition = "top") =>
        dispatchToast(
            <Toast>
                <ToastTitle
                    action={
                        <ToastTrigger>
                            <Link>Dismiss</Link>
                        </ToastTrigger>
                    }
                >
                    {message}
                </ToastTitle>
            </Toast>,
            {toastId, timeout, intent, position, politeness: "assertive",}
        );

    useEffect(() => {
        if (!worker.current) {
            const llmWorker = new Worker(new URL('@/workers/LLMWorker', import.meta.url), {type: "module"});
            llmWorker.onmessage = onMessage;
            llmWorker.postMessage(new LLMInitArgs('init', model_id))
            worker.current = llmWorker;
        }

        return () => {
            worker.current?.removeEventListener('message', onMessage);
        }
    }, []);


    function handleSubmit(message: string) {
        setSlmState(SLMState.GENERATING);
        const updatedMessages = [...messages, {
            role: 'user',
            content: message,
        }]
        setMessages(updatedMessages);
        worker.current?.postMessage(new LLMGenerateArgs('generate', updatedMessages))
    }

    if (IS_WEBGPU_AVAILABLE) {
        return (
            <div className={classes.container}>
                <MessageHolder messages={messages}/>
                <Text
                    align="center">{slmState === SLMState.INITIALIZING ? "Downloading model files ..." : `Generated ${tps} tokens / second`}</Text>
                {slmState === SLMState.INITIALIZING ? <FileProgressBar progressIndicators={fileProgressIndicators}/> :
                    <MessageInput onSubmit={handleSubmit} disabled={!(slmState === SLMState.READY)}/>}
                <Toaster toasterId={toasterId}/>
            </div>
        )
    } else {
        return (
            <div className={classes.container}>
                <Text size={500} align="center">Sorry, web gpu is not supported on your browser yet!</Text>
            </div>
        )
    }
}