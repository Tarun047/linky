import {FileProgressIndicator} from "../workers/types/LLMWorkerResponse.ts";
import {Field, makeStyles, ProgressBar} from "@fluentui/react-components";

export type FileProgressBarProps = {
    progressIndicators: FileProgressIndicator[]
}

const useStyles = makeStyles({
    progressIndicatorRoot: {
        paddingLeft: '8px',
        paddingRight: '8px',
    }
})

export default function FileProgressBar({progressIndicators}: FileProgressBarProps) {
    const classes = useStyles();
    return (
        <div className={classes.progressIndicatorRoot}>
            {progressIndicators.map(progressIndicator =>
                <Field key={progressIndicator.file} validationMessage={`${progressIndicator.file}`}
                       validationState="none">
                    <ProgressBar value={progressIndicator.progress} max={100}/>
                </Field>
            )}
        </div>
    )
}