import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type alertTitleProps = {
    title: string,
    body: string
}

function AlertTitle ({
    title,
    body
} : alertTitleProps ) {
    return (
        <AlertDialog>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogContent>{body}</AlertDialogContent>
        </AlertDialog>
    )
}

export { AlertTitle }