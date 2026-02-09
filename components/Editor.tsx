"use client";
//frontend editor
import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { useCallback, useEffect, useRef, useState } from "react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { Avatars } from "@/components/Avatars";
import { Toolbar } from "@/components/Toolbar";
import { extensionToLanguage } from "@/lib/languageExtensions";
import type { LanguageSupport } from "@codemirror/language";
import { useGetFile } from "@/features/files/api/useGetFile";

import type { File } from "@/app/api/files/route";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Textarea } from "./ui/textarea";
import {io,Socket} from "socket.io-client"
type Props = {
  file: File;
};
export function CollaborativeEditor({ file }: Props) {
  const room = useRoom();
  const res = useGetFile(file.fileId);
  const provider = getYjsProviderForRoom(room);
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();
  const [ytext, setYText] = useState<Y.Text | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [stdinLines, setStdinLines] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [lastStdin, setLastStdin] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
    useEffect(() => {
    if (!file) {
      setYText(null);
      setOutput("");
      setShowOutput(false);
      setUserInput("");
      setStdinLines([]);
      setLastStdin(null);
    }
  }, [file]);
  const filename = file.name;
  const extension = filename.split(".").pop() ?? "js";
  const [langFunc, langName, version] = extensionToLanguage(extension);


  const userInfo = useSelf((me) => me.info);
  useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,{transports:["websocket"]}); // your Next+Socket.IO server
  socketRef.current=socket
  socketRef.current.on("connect", () => {
    console.log("🟢 Connected to server:", socket.id);
  });

  // When the backend sends code execution results
  socketRef.current.on("execution_output", (data) => {
    console.log("📩 Received execution output:", data);
    setShowOutput(true);
     
      
    // You can integrate this with your outputData state
    // Example:
    // setOutputData(data);
  });

  // When backend requests input (e.g., stdin)
  socketRef.current.on("request_input", (prompt) => {
    console.log("🟨 Server requesting input:", prompt);
    // You can show a prompt or use your userInput textarea
  });

  // 🔹 Listen for server asking to end the input stream
  socketRef.current.on("input_end", () => {
    console.log("⚫ Input stream ended by server");
  });
  socketRef.current.on("output", (data: string) => {
  setOutput((prev) => prev + data);
  
});
  socketRef.current.on("disconnect", () => {
    console.log("🔴 Disconnected from server");
  });
  socketRef.current.on("execution_done", () => {
  setIsRunning(false);
});
  socketRef.current.on("execution_start", () => {
  setIsRunning(true);
  setShowOutput(true);
  setOutput("");
});
socketRef.current.onAny((event, ...args) => {
  console.log("📡 socket event:", event, args);
});

  return () => {
    socketRef.current?.disconnect();
  };
}, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (userInput.trim() !== "") {
        socketRef.current?.emit("stdin",userInput+"\n")
        setStdinLines((prev) => [...prev, userInput]);
        
        setUserInput("");
         
      
      }
    }
  };

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || !room || !userInfo || !file) return;

    provider.connect();
    const ydoc = provider.getYDoc();
    const ytext = ydoc.getText("content");
    setYText(ytext);

    const undoManager = new Y.UndoManager(ytext);
    setYUndoManager(undoManager);

    const isFresh = ytext.toString().trim().length === 0;
    const isDBContentAvailable = !!res.data.content;

    if (isFresh && isDBContentAvailable) {
      ytext.delete(0, ytext.length);
      ytext.insert(0, res.data.content);
    }

    provider.awareness.setLocalStateField("user", {
      name: userInfo.name,
      color: userInfo.color,
      colorLight: userInfo.color + "80",
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        langFunc as LanguageSupport,
        yCollab(ytext, provider.awareness, { undoManager }),
      ],
    });

    const view = new EditorView({
      state,
      parent: element,
    });


    

    return () => {
      view.destroy();
    };
  }, [element, room, userInfo, res.data,file]);

  const handleRunCode = () => {
    if (!ytext) return;

    const code = ytext.toString();
   

    setLastStdin(""); // store last stdin
    setStdinLines([]); // clear for next run
    setUserInput("");
    setShowOutput(true);
    setOutput("");
    setIsRunning(true);
      socketRef.current?.emit("run_code", {
    language: extension,
    version,
    code,
   
    });
  }
    
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="flex flex-col w-full h-full rounded-xl bg-[#1E1E2E] text-[#D4D4D4] overflow-hidden">
      <div className="flex justify-between items-center p-2 border-b border-gray-700">
        <div className="flex items-center">
          {yUndoManager && <Toolbar yUndoManager={yUndoManager} />}
          <button
            onClick={handleRunCode}
            className="ml-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Run
          </button>
        </div>
        <Avatars />
      </div>

      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <div className="relative h-full" ref={ref}></div>
        </ResizablePanel>

        {/* Stdin Input */}
        <ResizablePanel>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type stdin here. Press Enter for new line."
            className="bg-[#2E2E3E] text-white font-mono"
          />
        </ResizablePanel>

  
        <ResizablePanel className="border-t border-gray-500 p-2">
          <h1 className="font-semibold text-white">Output</h1>
          <div
            ref={outputRef}
            className="h-40 overflow-auto bg-black p-2 text-white font-mono"
          >
            {showOutput ? (
              isRunning ? (
                <div className="text-gray-400 italic">Running...</div>
              ) : (
                <pre>
                  {lastStdin && (
                    <div className="text-gray-400">
                      <strong>stdin:</strong>
                      <br />
                      {lastStdin}
                      <br />
                    </div>
                  )}
                  {output || "No output"}
                </pre>
              )
            ) : (
              <div className="text-gray-500 italic">Run the code to see output</div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
  }