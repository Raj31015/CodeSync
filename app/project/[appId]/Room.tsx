"use client";

import { ReactNode } from "react";
import {

  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

export function Room({ children,roomId }: { children: ReactNode;roomId:string }) {
  return (
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    
  );
}