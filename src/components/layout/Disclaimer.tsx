import {LuShieldAlert} from "react-icons/lu";

export function Disclaimer({text}: {text: string}) {
  return (
    <aside className="border-b border-pv-red/25 bg-pv-red/8" role="note">
      <div className="pv-grid flex gap-3 py-3 text-xs leading-5 text-muted sm:text-sm">
        <LuShieldAlert className="mt-0.5 size-5 shrink-0 text-pv-red-bright" />
        <p>{text}</p>
      </div>
    </aside>
  );
}
