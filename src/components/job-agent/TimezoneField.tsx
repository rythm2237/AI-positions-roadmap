"use client";

import { useEffect, useState } from "react";

export function TimezoneField({ savedValue }: { savedValue?: string | null }) {
  const [value, setValue] = useState(savedValue ?? "");
  useEffect(() => {
    if (savedValue) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setValue(detected);
  }, [savedValue]);

  return (
    <label className="text-sm text-slate-400">
      Timezone
      <input
        name="timezone"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Europe/Berlin"
        className="input-field mt-2 min-h-11 w-full"
      />
    </label>
  );
}
