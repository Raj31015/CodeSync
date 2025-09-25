"use client";

import { useState, useRef, useEffect } from "react";
import { Folder, FolderOpen, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useCreateFolder } from "@/features/folders/api/useCreateFolder";
import { useCreateFile } from "@/features/files/api/useCreateFile";
import { useParams } from "next/navigation";
import { CreateFolderForm } from "@/features/folders/components/createFolderForm";
import { CreateFileForm } from "@/features/files/components/createFileForm";
import { useFoldersAndFiles } from "@/hooks/useFoldersAndFiles";

export type FileItem = {
  id: string;
  name: string;
  type: "file";
  parentId?: string;
};

export type FolderItem = {
  id: string;
  name: string;
  type: "folder";
  parentId?: string;
  children?: TreeNode[];
};

export type TreeNode = FileItem | FolderItem;

function buildTree(items: TreeNode[]): TreeNode[] {
  const lookup: Record<string, TreeNode & { children?: TreeNode[] }> = {};
  const tree: TreeNode[] = [];

  for (const item of items) {
    lookup[item.id] = { ...item, children: [] };
  }

  for (const item of items) {
    if (item.parentId && lookup[item.parentId]) {
      lookup[item.parentId].children!.push(lookup[item.id]);
    } else {
      tree.push(lookup[item.id]);
    }
  }

  return tree;
}

type FormType = "file" | "folder" | null;

function FileTree({
  nodes,
  path = "",
  selectedPath,
  setSelectedPath,
  setSelectedFolderId,
  foldermutation,
  filemutation,
  appId,
  formType,
  setFormType,
  selectedFolderId,
  selectedFileId,
  setSelectedFileId,
  inferredParentId,
}: {
  nodes: TreeNode[];
  path?: string;
  selectedPath: string | null;
  setSelectedPath: (path: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  foldermutation: ReturnType<typeof useCreateFolder>;
  filemutation: ReturnType<typeof useCreateFile>;
  appId: string;
  formType: FormType;
  setFormType: (value: FormType) => void;
  selectedFolderId: string | null;
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
  inferredParentId: string | null;
}) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const renderForm = (type: FormType, parentId: string | null, currentPath: string) => {
    if (formType !== type) return null;

    const onSuccess = (data: any) => {
      setFormType(null);
      const newPath = `${currentPath}/${data.name}`;
      setSelectedPath(newPath);
      setSelectedFolderId(data.folderId ?? null);
      if (type === "file") {
        setSelectedFileId(data.fileId);
      }
      setOpenFolders((prev) => ({ ...prev, [currentPath]: true }));
    };

    const FormComponent = type === "folder" ? CreateFolderForm : CreateFileForm;
    const mutation = type === "folder" ? foldermutation : filemutation;

    return (
      <div className="ml-6">
        <FormComponent
          defaultValues={{ name: "", appId }}
          onSubmit={(values: any) => {
            mutation.mutate(
              { ...values, folderId: parentId, parentId: parentId, appId },
              { onSuccess }
            );
          }}
          onClose={() => setFormType(null)}
        />
      </div>
    );
  };

  return (
    <ul className="pl-2 space-y-1">
      {nodes.map((node) => {
        const currentPath = `${path}/${node.name}`;
        const isSelected = selectedPath === currentPath;
        const isOpen = node.type === "folder" && openFolders[currentPath];
        const isFile = node.type === "file";
        const parentId = node.parentId ?? null;
        console.log(currentPath)
        return (
          <li key={node.id}>
            <div
              className={`flex items-center gap-2 cursor-pointer hover:opacity-80 px-2 rounded ${
                isSelected ? "bg-white/10 text-accent-foreground" : ""
              }`}
              onClick={() => {
                if (node.type === "folder") toggleFolder(currentPath);
                setSelectedPath(currentPath);
                setSelectedFolderId(isFile ? node.parentId ?? null : node.id);
                setSelectedFileId(isFile ? node.id : null);
              }}
            >
              {isFile ? <FileText size={16} /> : isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
              <span>{node.name}</span>
            </div>

            {isSelected && renderForm("folder", parentId, currentPath)}
            {isSelected && renderForm("file", parentId, currentPath)}

            {isOpen && node.type === "folder" && (
              <div className="ml-4 pl-2">
                <FileTree
                  nodes={node.children ?? []}
                  path={currentPath}
                  selectedPath={selectedPath}
                  setSelectedPath={setSelectedPath}
                  setSelectedFolderId={setSelectedFolderId}
                  foldermutation={foldermutation}
                  filemutation={filemutation}
                  appId={appId}
                  formType={formType}
                  setFormType={setFormType}
                  selectedFolderId={selectedFolderId}
                  selectedFileId={selectedFileId}
                  setSelectedFileId={setSelectedFileId}
                  inferredParentId={parentId}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function SidebarFileTree({
  selectedFileId,
  setSelectedFileId,
}: {
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [formType, setFormType] = useState<FormType>(null);

  const params = useParams();
  const rawAppId = params?.appId;

  if (typeof rawAppId !== "string") return <div>Invalid or missing appId</div>;
  const appId = rawAppId;

  const { data: flatItems = [] } = useFoldersAndFiles(appId);
  const foldermutation = useCreateFolder();
  const filemutation = useCreateFile();

  const parentFolderIdFromFile = flatItems.find(
    (it): it is FileItem => it.type === "file" && it.id === selectedFileId
  )?.parentId;

  const inferredParentId = selectedFolderId ?? parentFolderIdFromFile ?? null;

  const tree = buildTree(flatItems);
  console.log("SelectefildeID",selectedFileId)
    console.log("SelectefolderID",selectedFolderId)

  return (
    <div className="flex">
      <aside className="w-12 flex justify-center items-start p-2">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FolderOpen /> : <Folder />}
        </Button>
      </aside>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 250 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden bg-muted text-sm border-r h-screen flex flex-col"
      >
        {sidebarOpen && (
          <>
          <div className="p-2">
            <div className="flex justify-between items-center">
              <h2 className="text-muted-foreground mb-2 font-medium">Files</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Plus size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#3d3f52] border-none rounded-xl">
                  <DropdownMenuItem
                    className="hover:bg-[#46485c] hover:text-white cursor-pointer"
                    onClick={() => setFormType("file")}
                  >
                    New file
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white" />
                  <DropdownMenuItem
                    className="hover:bg-[#46485c] hover:text-white cursor-pointer"
                    onClick={() => setFormType("folder")}
                  >
                    New folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Root-level form */}
            {formType && !selectedFolderId && !selectedFileId && (
              <div className="pl-2 mb-2">
                {(formType === "folder" ? (
                  <CreateFolderForm
                    defaultValues={{ name: "", appId }}
                    onSubmit={(values) => {
                      foldermutation.mutate(
                        { ...values, parentId: inferredParentId },
                        {
                          onSuccess: (data) => {
                            setFormType(null);
                            setSelectedPath(`/${data.name}`);
                            setSelectedFolderId(data.folderId);
                          },
                        }
                      );
                    }}
                    onClose={() => setFormType(null)}
                  />
                ) : (
                  <CreateFileForm
                    defaultValues={{ name: "", appId }}
                    onSubmit={(values) => {
                      filemutation.mutate(
                        { ...values, folderId: inferredParentId },
                        {
                          onSuccess: (data) => {
                            setFormType(null);
                            setSelectedPath(`/${data.name}`);
                            setSelectedFileId(data.fileId);
                            setSelectedFolderId(data.folderId ?? null);
                          },
                        }
                      );
                    }}
                    onClose={() => setFormType(null)}
                  />
                ))}
              </div>
            )}

            <FileTree
              nodes={tree}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              setSelectedFolderId={setSelectedFolderId}
              foldermutation={foldermutation}
              filemutation={filemutation}
              appId={appId}
              formType={formType}
              setFormType={setFormType}
              selectedFolderId={selectedFolderId}
              selectedFileId={selectedFileId}
              setSelectedFileId={setSelectedFileId}
              inferredParentId={inferredParentId}
            />
          </div>
          <div className="flex-1 overflow-auto" onClick={()=>{setSelectedFileId(null)
            setSelectedFolderId(null)
            setSelectedPath(null)
          }}>

          </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}
