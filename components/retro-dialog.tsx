"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { RetroWindow } from "@/components/retro-window";
import { JSX, ReactNode, useState } from "react";

type Props = {
  title?: string;
  initialOpen?: boolean;
  onClose?: () => void;
  footer?: (close: () => void) => JSX.Element;
  children: ReactNode;
};

export function RetroDialog({ title = "Room Created", initialOpen = true, onClose, footer, children }: Props) {
  const [open, setOpen] = useState(initialOpen);

  const openHandler = (state: boolean) => {
    if (!state) {
      onClose?.();
    }

    setOpen(state);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle hidden={true}>{title}</DialogTitle>
      <DialogDescription hidden={true}>{title}</DialogDescription>
      <DialogContent
        className={"border-0 p-0 rounded-none [&>button:first-of-type]:hidden"}
      >
        <RetroWindow title={title} onClose={() => openHandler(false)}>
          {children}
          {footer?.(() => openHandler(false))}
        </RetroWindow>
      </DialogContent>
    </Dialog>
  );
}
