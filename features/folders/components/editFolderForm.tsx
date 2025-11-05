
import { useForm} from "react-hook-form";
import { zodResolver} from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { insertFolderSchema } from "@/db/schema";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import { useEffect, useRef } from "react";

const formSchema= insertFolderSchema.pick({name:true,appId:true,})

type FormValues={name:string,
    appId:string,
    parentId?:string

};

type Props={
    id?:string;
    defaultValues?: FormValues ;
    onSubmit: (values:FormValues)=> void;
    onDelete?: ()=>void;
    disabled?: boolean;
    onClose:()=>void

};
export const EditFolderForm = ({ defaultValues, onSubmit, disabled, onClose }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  disabled={disabled}
                  placeholder={defaultValues?.name}
                  {...field}
                  ref={(el) => {
                    field.ref(el);
                    inputRef.current = el;
                  }}
                  className="border border-neutral-500 h-6"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};