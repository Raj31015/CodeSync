import {z} from "zod";
import {Trash} from "lucide-react";
import { useForm} from "react-hook-form";
import { zodResolver} from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertAppSchema } from "@/db/schema";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import { Plus } from "lucide-react";
const formSchema= z.object({
    name: z
    .string()
    .min(1, { message: "Name must be at least 1 characters long" }),
})

type FormValues={name:string};

type Props={
    id?:string;
    defaultValues?: FormValues ;
    onSubmit: (values:FormValues)=> void;
    onDelete?: ()=>void;
    disabled?: boolean;

};
export const AppForm= ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled
}:Props)=>{
const form=useForm<FormValues>({
    resolver:zodResolver(formSchema),
    defaultValues:defaultValues
});
const handleSubmit=(values:FormValues)=>{
    onSubmit(values);
    form.reset()

};
const handleDelete=()=>{
    onDelete?.();
}

return(
    
    <Form {...form}>
        <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4 "
        >
            <FormField
            name="name"
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel className="text-3xl ">
                        Name
                    </FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-x-2">
                         <Input
                            className="border rounded-xl border-neutral-500"
                            
        disabled={disabled}
        placeholder="e.g. Calculator"
                            {...field}
                        />
                        <Button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-500/40"
                            disabled={disabled}
                        >
                            <Plus className="mr-1" />
                            Create App
                        </Button>
                        </div>
                    </FormControl>
                    <FormMessage/>
           
                </FormItem>
               )}
            />
           
        </form>
    </Form>
)
};