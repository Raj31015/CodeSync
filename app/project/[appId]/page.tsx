"use client";

import { CollaborativeEditor } from "@/components/Editor";
import { Room } from "./Room";
import SidebarFileTree from "@/components/FileBar";
import { useEffect, useState } from "react";
import { useGetFile } from "@/features/files/api/useGetFile";
import { useGetFiles } from "@/features/files/api/useGetFiles";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { useGetApp } from "@/features/apps/api/useGetApp";

const Home = () => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const { appId } = useParams();
  const router = useRouter();

  if (typeof appId !== "string") {
    throw new Error("Invalid appId param");
  }

  const appQuery = useGetApp(appId);
  const filesQuery = useGetFiles(appId as string);
  const latestFile = filesQuery.data?.[0] ?? null;

  // Load file based on selectedFileId OR fallback to latestFile for initial display
  const fileToLoad = selectedFileId ?? latestFile?.fileId ?? "";
  const fileQuery = useGetFile(fileToLoad);

  const isLoading =
    appQuery.isLoading ||
    filesQuery.isLoading ||
    (fileToLoad && fileQuery.isLoading);

  const file = fileQuery.data ?? null;

  if (!selectedFileId && !latestFile) {
    return (
      <div>
        <header className="border-b-[1px] p-4 border-none w-full flex">
          <div className="flex items-center">
            <HomeIcon
              className="text-xs text-gray-300/40 cursor-pointer hover:text-white"
              onClick={() => {
                router.push("/");
              }}
            />
            <h1 className="text-xl ml-4">{appQuery.data?.name ?? "App"}</h1>
          </div>
          <Button>Run</Button>
        </header>
        <div className="h-screen flex">
          <SidebarFileTree
            setSelectedFileId={setSelectedFileId}
            selectedFileId={selectedFileId}
          />
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="mb-4 text-lg">No files found. Start by creating one!</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !fileToLoad || !file) {
    return (
      <div className="flex flex-col">
      <header className="border-b-[1px] p-4 border-none w-full flex">
          <div className="flex items-center">
            <HomeIcon
              className="text-xs text-gray-300/40 cursor-pointer hover:text-white"
              onClick={() => {
                router.push("/");
              }}
            />
            <h1 className="text-xl ml-4">{appQuery.data?.name ?? "App"}</h1>
          </div>
          <Button>Run</Button>
        </header>
      <div className="h-screen flex">
        <SidebarFileTree
          setSelectedFileId={setSelectedFileId}
          selectedFileId={selectedFileId}
        />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading file...
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
       <header className="border-b-[1px] p-4 border-none w-full flex">
          <div className="flex items-center">
            <HomeIcon
              className="text-xs text-gray-300/40 cursor-pointer hover:text-white"
              onClick={() => {
                router.push("/");
              }}
            />
            <h1 className="text-xl ml-4">{appQuery.data?.name ?? "App"}</h1>
          </div>
          <Button>Run</Button>
        </header>
       <div className="h-screen flex">
      <SidebarFileTree
        setSelectedFileId={setSelectedFileId}
        selectedFileId={selectedFileId}
      />
      <Room roomId={fileToLoad}>
        <CollaborativeEditor file={file} />
      </Room>
    </div>
    </div>
   
  );
};

export default Home;
