export const NOTE_CREATED_EVENT = "opsflow:note-created";

export function emitNoteCreated(note) {
  window.dispatchEvent(
    new CustomEvent(NOTE_CREATED_EVENT, {
      detail: note,
    })
  );
}

export function subscribeToNoteCreated(listener) {
  const handleEvent = (event) => {
    listener(event.detail);
  };

  window.addEventListener(NOTE_CREATED_EVENT, handleEvent);

  return () => {
    window.removeEventListener(NOTE_CREATED_EVENT, handleEvent);
  };
}
