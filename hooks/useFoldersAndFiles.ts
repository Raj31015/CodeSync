import { useGetFolders } from "@/features/folders/api/useGetFolders";
import { useGetFiles } from "@/features/files/api/useGetFiles";
import { TreeNode } from "@/components/FileBar";
import { useMemo } from "react";

export const useFoldersAndFiles = (appId:string) => {
  const {
    data: folders = [],
    isLoading: foldersLoading,
    isError: foldersError,
  } = useGetFolders(appId);

  const {
    data: files = [],
    isLoading: filesLoading,
    isError: filesError,
  } = useGetFiles(appId);

  const combined: TreeNode[] = useMemo(() => {
    const formattedFolders: TreeNode[] = folders.map((f: any) => ({
      id: f.folderId,
      name: f.name,
      parentId: f.parentId,
      type: "folder",
      children: [],
    }));

    const formattedFiles: TreeNode[] = files.map((f: any) => ({
      id: f.fileId,
      name: f.name,
      parentId: f.folderId,
      type: "file",
    }));

    return [...formattedFolders, ...formattedFiles];
  }, [folders, files]);

  return {
    data: combined,
    isLoading: foldersLoading || filesLoading,
    isError: foldersError || filesError,
  };
};
