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
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [openNotif, setOpenNotif] = useState(false);

  // Dummy notifications
  const notifications = [
    { id: 1, message: 'Riya invited you to Project Alpha', time: '2m ago' },
    { id: 2, message: 'Your request to join Project Beta was accepted', time: '1h ago' },
  ];

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
    <header className="w-full px-6 py-4 border-b border-gray-300/40 flex flex-row justify-between items-center relative">
      {/* Left section: logo */}
      <div className='flex items-center gap-2 px-4'>
        <Image src="logo2.svg" alt='logo' height={40} width={40}/>
        <h1 className="text-lg font-semibold">Codesync</h1>
      </div>

      {/* Middle: search */}
      <div className="relative flex items-center max-w-xl w-full">
        <Form {...form}>
          <form className="w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Search by username"
                      {...field}
                      className="rounded-md w-full"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Search results */}
        {users.length > 0 && (
          <ul className="absolute top-full mt-2 w-64 bg-background border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto z-40">
            {users.map((user) => (
              <li
                key={user.id}
                className="px-4 py-2 hover:bg-muted cursor-pointer transition"
              >
                <p className="font-medium">
                  {user.username || `${user.firstName ?? ''} ${user.lastName ?? ''}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4 relative ml-6 bg-inherit">
        {/* 🔔 Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative p-2 hover:bg-muted rounded-full transition"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2" />
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-[#505462] shadow-lg rounded-xl border z-50"
              >
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <a href="/Inbox" className="text-xs text-blue-500 hover:underline">
                      View all
                    </a>
                  </div>

                  {notifications.length ? (
                    <div className="space-y-2">
                      {notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-md hover:bg-muted/50 text-sm cursor-pointer transition"
                        >
                          <p>{n.message}</p>
                          <span className="text-xs text-muted-foreground">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No new notifications
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clerk User Avatar */}
        <UserButton />
      </div>
    </header>
  );
}
