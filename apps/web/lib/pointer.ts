// Autofocus is a convenience on desktop and a nuisance on touch — focusing a
// text input on iOS summons the keyboard over half the screen. Picker-style
// surfaces (chips first, typing optional) should only autofocus where a fine
// pointer is present; writing surfaces keep unconditional autofocus, since
// there the keyboard IS the task.
export function hasFinePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  )
}
