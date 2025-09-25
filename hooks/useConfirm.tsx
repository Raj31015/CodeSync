import {useState} from "react"
import { Button } from "@/components/ui/button"
import { JSX } from "react"
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog"
export const useConfirm=(
    title:string,
    message:string,
):[()=>JSX.Element,()=>Promise<unknown>]=>{
    const [promise,setPromise]=useState<{resolve:(value:boolean)=> void} | null>(null);
    const confirm=()=>new Promise((resolve,reject)=>{
        setPromise({resolve});
    });
    const handleClose=()=>{
        setPromise(null);
    };
    const handleConfirm=()=>{
        promise?.resolve(true);
        handleClose();
    };
    const handleCancel=()=>{
        promise?.resolve(false);
        handleClose();
    }
    const ConfirmationDialog=()=>(
        <Dialog open={promise !== null}
        onOpenChange={(isOpen)=>{
            if(!isOpen){
                setPromise(null)
            }
        }}
        >
            <DialogContent className="bg-[#3D3F52]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-2">
                    <Button 
                    onClick={handleCancel}
                    variant="outline">
                        Cancel
                    </Button>
                    <Button 
                    onClick={handleConfirm}
                    variant='destructive'
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
    return [ConfirmationDialog,confirm];
}