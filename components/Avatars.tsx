import { useOthers, useSelf } from "@liveblocks/react/suspense";

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className="flex px-3">
      {users.map(({ connectionId, info }) => (
        <Avatar key={connectionId} picture={info.picture} name={info.name} />
      ))}

      {currentUser && (
        <div className="relative ml-8 first:ml-0">
          <Avatar
            picture={currentUser.info.picture}
            name={currentUser.info.name}
          />
        </div>
      )}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div
      className="relative flex items-center justify-center w-[42px] h-[42px] bg-gray-400 rounded-full border-4 border-white ml-[-0.75rem] hover:before:opacity-100 before:absolute before:top-full before:mt-2 before:opacity-0 before:transition-opacity before:duration-150 before:text-white before:text-xs before:rounded before:py-[5px] before:px-[10px] before:bg-black before:whitespace-nowrap"
      data-tooltip={name}
    >
      <img src={picture} className="w-full h-full rounded-full" alt={name} />
    </div>
  );
}