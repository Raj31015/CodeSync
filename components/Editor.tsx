"use client";

import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { useCallback, useEffect, useState } from "react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { Avatars } from "@/components/Avatars";
import { Toolbar } from "@/components/Toolbar";
import { extensionToLanguage } from "@/lib/languageExtensions";
import type { LanguageSupport } from "@codemirror/language";
import { useGetFile } from "@/features/files/api/useGetFile";
import { CodeRunner } from "@/features/run/api/useRunner";
import type { File } from "@/app/api/files/route";
import { ResizablePanel, ResizablePanelGroup,ResizableHandle } from "./ui/resizable";
import { Textarea } from "./ui/textarea";

type Props = {
  file: File;
};

export function CollaborativeEditor({ file }: Props) {
  const room = useRoom();
  const res = useGetFile(file.fileId);
  const provider = getYjsProviderForRoom(room);
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();
  const [ytext, setYText] = useState<Y.Text | null>(null); // for reading live content
  const [showOutput,setShowOutput]=useState(false)
  const [userInput, setUserInput] = useState(""); // for stdin
  const [inputLines, setInputLines] = useState<string[]>([]);
  const filename = file.name;
  const extension = filename.split(".").pop() ?? "js";
  const [langFunc, langName, version] = extensionToLanguage(extension);
  const { mutate: runCode, data: outputData, isPending } = CodeRunner();



// Handle Enter key
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (userInput.trim() !== "") {
      setInputLines((prev) => [...prev, userInput]);
      setUserInput("");
    }
  }
};
const finalStdin = inputLines.join("\n");
  const userInfo = useSelf((me) => me.info);


  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || !room || !userInfo) return;

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
  }, [element, room, userInfo, res.data]);

  // Run button handler
  const handleRunCode = () => {
    if (!ytext) return;

    const code = ytext.toString();
    runCode({
      language: langName,
      version,
      code,
      stdin:userInput ?? undefined
    });
    setShowOutput(true)
   
  };

  return (
    <div className="flex flex-col relative w-full h-full overflow-hidden rounded-xl bg-[#1E1E2E] text-[#D4D4D4]">
      <div className="flex justify-between items-center">
        <div>
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
         <div className="relative" ref={ref}></div>
        </ResizablePanel>
         <ResizablePanel>
         <Textarea value={userInput ?? ""}
         onChange={(e)=>setUserInput(e.target.value)}
         
         >

         </Textarea>
        </ResizablePanel>
      
        <ResizablePanel className="border-t border-gray-500" >
            <h1>Output console</h1>
            {showOutput && !isPending && `${outputData.run.stdout || outputData.run.stderr }`}
        </ResizablePanel>
      </ResizablePanelGroup>

      
    </div>
  );
}
