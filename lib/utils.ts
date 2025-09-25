import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { z } from "zod";

const allowedExtensions = ['js', 'ts', 'jsx', 'tsx', 'json', 'md','java','py','html','rs'];

export const insertFileSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name too long")
    .regex(/^[^<>:"/\\|?*\x00-\x1F]+$/, {
      message:
        "Invalid characters: < > : \" / \\ | ? * and control characters are not allowed",
    })
    .refine(name => !name.startsWith('.'), {
      message: "File name cannot start with a dot",
    })
    .refine(name => !name.endsWith('.'), {
      message: "File name cannot end with a dot",
    })
    .refine(name => {
      const parts = name.split('.');
      return parts.length > 1 && allowedExtensions.includes(parts.pop()!);
    }, {
      message: `File must have a valid extension: ${allowedExtensions.join(', ')}`,
    })
    .refine(name => !["CON", "PRN", "AUX", "NUL"].includes(name.toUpperCase()), {
      message: "Reserved name not allowed (e.g. CON, PRN, NUL)",
    })
    .refine(name => !/^(COM[1-9]|LPT[1-9])$/i.test(name), {
      message: "Reserved name not allowed (e.g. COM1, LPT1)",
    }),

  appId: z.string().min(1, "Missing appId"),
});
