'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { getItemCleanStart } from 'yjs';

interface User {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const formSchema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function Header() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const watchName = form.watch('name');
  const debouncedQuery = useDebounce(watchName, 300);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      return;
    }
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search-users?query=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data: User[] = await res.json();
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  return (
    <header className="w-full px-6 py-4 border-b border-gray-300/40 flex flex-row justify-between">
      <div className='flex items-center gap-2 px-4'>
        <Image src="logo2.svg" alt='logo' height={40} width={40}/>
        <h1>Codesync</h1>

      </div>
     
      <div className="max-w-xl flex">
        <Form {...form}>
          <form className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  
                  <FormControl>
                    <Input
                      placeholder="Search by username "
                      {...field}
                      className="rounded-md"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>


        {users.length > 0 && (
          <ul className="absolute z-10 mt-10 min-w-52 bg-[#2d2f45] border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto">
            {users.map((user) => (
              <li
                key={user.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
              >
                <p className="font-medium">
                  {user.username || `${user.firstName ?? ''} ${user.lastName ?? ''}`}
                </p>
                
              </li>
            ))}
          </ul>
        )}

       
        <div className='ml-8'>
          
    
           <UserButton/>
        </div>
         
      </div>
    
    </header>
  );
}
