import { useEffect, useMemo, useState } from "react";
import {
  createNote,
  deleteNote,
  getMyOrganizations,
  getNotes,
  getOrganizationProjects,
  updateNote,
} from "../../api";
import usePersistentState from "../../hooks/usePersistentState";
import { subscribeToNoteCreated } from "../../lib/noteEvents";

const noteKindFilters = [
  { id: "ALL", label: "All" },
  { id: "NOTE", label: "Notes" },
  { id: "REFERENCE", label: "References" },
  { id: "PINNED", label: "Pinned" },
];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "Unknown";

const getCreatorName = (note) =>
  note.createdBy?.fullName ||
  note.createdBy?.username ||
  note.createdBy?.email ||
  "Unknown";

const getSnippet = (content) => {
  const text = content?.trim();

  if (!text) {
    return "No content yet";
  }

  return text.length > 160 ? `${text.slice(0, 160)}...` : text;
};

const compareNotes = (left, right) => {
  if (left.isPinned !== right.isPinned) {
    return left.isPinned ? -1 : 1;
  }

  const leftPinnedAt = left.pinnedAt ? new Date(left.pinnedAt).getTime() : 0;
  const rightPinnedAt = right.pinnedAt ? new Date(right.pinnedAt).getTime() : 0;

  if (leftPinnedAt !== rightPinnedAt) {
    return rightPinnedAt - leftPinnedAt;
  }

  const leftUpdatedAt = left.updatedAt
    ? new Date(left.updatedAt).getTime()
    : 0;
  const rightUpdatedAt = right.updatedAt
    ? new Date(right.updatedAt).getTime()
    : 0;

  if (leftUpdatedAt !== rightUpdatedAt) {
    return rightUpdatedAt - leftUpdatedAt;
  }

  const leftCreatedAt = left.createdAt
    ? new Date(left.createdAt).getTime()
    : 0;
  const rightCreatedAt = right.createdAt
    ? new Date(right.createdAt).getTime()
    : 0;

  return rightCreatedAt - leftCreatedAt;
};

const matchesNoteSearch = (note, search) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return `${note.title || ""} ${note.content || ""} ${note.kind || ""}`
    .toLowerCase()
    .includes(query);
};

export default function NotesWorkspace({ token }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = usePersistentState(
    "opsflow.notes.selectedOrgId",
    ""
  );
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = usePersistentState(
    "opsflow.notes.selectedNoteId",
    ""
  );
  const [search, setSearch] = usePersistentState(
    "opsflow.notes.search",
    ""
  );
  const [kindFilter, setKindFilter] = usePersistentState(
    "opsflow.notes.kindFilter",
    "ALL"
  );
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newKind, setNewKind] = useState("NOTE");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editKind, setEditKind] = useState("NOTE");
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinningNoteId, setPinningNoteId] = useState(null);
  const [error, setError] = useState("");

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );
  const sortedNotes = useMemo(
    () => [...notes].sort(compareNotes),
    [notes]
  );
  const visibleNotes = useMemo(() => {
    if (kindFilter === "PINNED") {
      return sortedNotes.filter((note) => note.isPinned);
    }

    if (kindFilter === "NOTE" || kindFilter === "REFERENCE") {
      return sortedNotes.filter((note) => note.kind === kindFilter);
    }

    return sortedNotes;
  }, [kindFilter, sortedNotes]);
  const pinnedNotes = useMemo(
    () => visibleNotes.filter((note) => note.isPinned),
    [visibleNotes]
  );
  const regularNotes = useMemo(
    () => visibleNotes.filter((note) => !note.isPinned),
    [visibleNotes]
  );

  useEffect(() => {
    let active = true;

    const loadOrganizations = async () => {
      setLoadingOrganizations(true);
      setError("");

      try {
        const res = await getMyOrganizations(token);

        if (!active) return;

        const nextOrganizations = res.data || [];
        setOrganizations(nextOrganizations);
        setSelectedOrgId((currentId) =>
          nextOrganizations.some((org) => org.id === currentId)
            ? currentId
            : nextOrganizations[0]?.id || ""
        );
      } catch {
        if (active) {
          setError("Could not load organizations.");
        }
      } finally {
        if (active) {
          setLoadingOrganizations(false);
        }
      }
    };

    loadOrganizations();

    return () => {
      active = false;
    };
  }, [setSelectedOrgId, token]);

  useEffect(() => {
    if (!selectedOrgId) {
      setProjects([]);
      setNotes([]);
      setSelectedNoteId("");
      return;
    }

    let active = true;

    const loadWorkspaceData = async () => {
      setLoadingNotes(true);
      setError("");

      try {
        const [projectsRes, notesRes] = await Promise.all([
          getOrganizationProjects(token, selectedOrgId),
          getNotes(token, {
            organizationId: selectedOrgId,
            kind:
              kindFilter === "NOTE" || kindFilter === "REFERENCE"
                ? kindFilter
                : undefined,
            q: search.trim() || undefined,
          }),
        ]);

        if (!active) return;

        const nextProjects = projectsRes.data || [];
        const nextNotes = notesRes.data || [];
        setProjects(nextProjects);
        setNotes(nextNotes);
        setSelectedNoteId((currentId) =>
          nextNotes.some((note) => note.id === currentId)
            ? currentId
            : nextNotes[0]?.id || ""
        );
      } catch {
        if (active) {
          setProjects([]);
          setNotes([]);
          setSelectedNoteId("");
          setError("Could not load notes.");
        }
      } finally {
        if (active) {
          setLoadingNotes(false);
        }
      }
    };

    loadWorkspaceData();

    return () => {
      active = false;
    };
  }, [kindFilter, search, selectedOrgId, setSelectedNoteId, token]);

  useEffect(() => {
    setEditTitle(selectedNote?.title || "");
    setEditContent(selectedNote?.content || "");
    setEditProjectId(selectedNote?.projectId || "");
    setEditKind(selectedNote?.kind || "NOTE");
  }, [selectedNote]);

  useEffect(() => {
    return subscribeToNoteCreated((note) => {
      if (
        note.organizationId !== selectedOrgId ||
        !matchesNoteSearch(note, search)
      ) {
        return;
      }

      if (kindFilter === "PINNED" && !note.isPinned) {
        return;
      }

      if (
        (kindFilter === "NOTE" || kindFilter === "REFERENCE") &&
        note.kind !== kindFilter
      ) {
        return;
      }

      setNotes((current) => {
        const exists = current.some(
          (currentNote) => currentNote.id === note.id
        );

        if (exists) {
          return current;
        }

        return [note, ...current].sort(compareNotes);
      });
    });
  }, [kindFilter, search, selectedOrgId]);

  const updateNoteInState = (noteId, updater) => {
    setNotes((current) =>
      current
        .map((note) =>
          note.id === noteId ? updater(note) : note
        )
        .sort(compareNotes)
    );
  };

  const handleCreateNote = async (event) => {
    event.preventDefault();

    const title = newTitle.trim();

    if (!title || !selectedOrgId) {
      setError("Note title and organization are required.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await createNote(token, {
        title,
        content: newContent,
        organizationId: selectedOrgId,
        projectId: newProjectId || undefined,
        kind: newKind,
      });

      const createdNote = res.data;
      setNotes((current) => [createdNote, ...current].sort(compareNotes));
      setSelectedNoteId(createdNote.id);
      setNewTitle("");
      setNewContent("");
      setNewProjectId("");
      setNewKind("NOTE");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create note.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateNote = async (event) => {
    event.preventDefault();

    if (!selectedNote) return;

    const title = editTitle.trim();

    if (!title) {
      setError("Note title is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await updateNote(token, selectedNote.id, {
        title,
        content: editContent,
        projectId: editProjectId || null,
        kind: editKind,
      });

      const updatedNote = res.data;
      setNotes((current) =>
        current
          .map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
          .sort(compareNotes)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not save note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    setDeleting(true);
    setError("");

    try {
      await deleteNote(token, selectedNote.id);
      setNotes((current) =>
        current.filter((note) => note.id !== selectedNote.id)
      );
      setSelectedNoteId("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete note.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (note) => {
    const nextPinned = !note.isPinned;
    const optimisticPinnedAt = nextPinned
      ? new Date().toISOString()
      : null;

    setPinningNoteId(note.id);
    setError("");

    updateNoteInState(note.id, (current) => ({
      ...current,
      isPinned: nextPinned,
      pinnedAt: optimisticPinnedAt,
    }));

    try {
      const res = await updateNote(token, note.id, {
        isPinned: nextPinned,
      });

      updateNoteInState(note.id, () => res.data);
    } catch (err) {
      updateNoteInState(note.id, (current) => ({
        ...current,
        isPinned: note.isPinned,
        pinnedAt: note.pinnedAt,
      }));
      setError(err.response?.data?.message || "Could not update pin.");
    } finally {
      setPinningNoteId(null);
    }
  };

  if (loadingOrganizations) {
    return <div className="workspace-placeholder">Loading notes...</div>;
  }

  return (
    <div className="notes-workspace">
      {error ? <div className="form-error notes-error">{error}</div> : null}

      <section className="note-panel note-compose-panel">
        <div className="note-panel-header">
          <div>
            <div className="dashboard-eyebrow">Notes</div>
            <h4>Operational memory</h4>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="org-empty-state">
            <h4>No organization yet</h4>
            <p>Create an organization before writing shared notes.</p>
          </div>
        ) : (
          <>
            <label className="form-label">
              Organization
              <select
                className="ui-input"
                value={selectedOrgId}
                onChange={(event) => setSelectedOrgId(event.target.value)}
              >
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Search notes
              <input
                className="ui-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Decision, reference, procedure..."
              />
            </label>

            <div className="notes-filter-strip" role="tablist" aria-label="Note filters">
              {noteKindFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={kindFilter === filter.id ? "active" : ""}
                  onClick={() => setKindFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <form className="note-form" onSubmit={handleCreateNote}>
              <div className="note-kind-toggle" role="tablist" aria-label="Create note type">
                <button
                  type="button"
                  className={newKind === "NOTE" ? "active" : ""}
                  onClick={() => setNewKind("NOTE")}
                >
                  New Note
                </button>
                <button
                  type="button"
                  className={newKind === "REFERENCE" ? "active" : ""}
                  onClick={() => setNewKind("REFERENCE")}
                >
                  New Reference
                </button>
              </div>

              <label className="form-label">
                {newKind === "REFERENCE" ? "New reference" : "New note"}
                <input
                  className="ui-input"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Note title"
                />
              </label>

              <label className="form-label">
                Link project
                <select
                  className="ui-input"
                  value={newProjectId}
                  onChange={(event) => setNewProjectId(event.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Content
                <textarea
                  className="ui-textarea"
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  placeholder="Decision, procedure, reference, or context..."
                  rows={5}
                />
              </label>

              <button
                type="submit"
                className="ui-button ui-button-primary"
                disabled={creating || !selectedOrgId}
              >
                {creating
                  ? "Creating..."
                  : newKind === "REFERENCE"
                    ? "Create reference"
                    : "Create note"}
              </button>
            </form>
          </>
        )}
      </section>

      <section className="note-panel note-list-panel">
        {loadingNotes ? (
          <div className="workspace-placeholder">Loading notes...</div>
        ) : visibleNotes.length === 0 ? (
          <div className="org-empty-state">
            <h4>No notes found</h4>
            <p>Operational notes and references for this organization will appear here.</p>
          </div>
        ) : (
          <div className="notes-list-sections">
            {pinnedNotes.length > 0 && (
              <div className="notes-list-section">
                <div className="dashboard-eyebrow">Pinned</div>
                <div className="note-card-grid">
                  {pinnedNotes.map((note) => (
                    <article
                      key={note.id}
                      className={
                        note.id === selectedNoteId
                          ? `note-card ${note.kind === "REFERENCE" ? "reference active" : "active"}`
                          : note.kind === "REFERENCE"
                            ? "note-card reference"
                            : "note-card"
                      }
                    >
                      <div className="note-card-actions">
                        {note.kind === "REFERENCE" && (
                          <span className="note-kind-pill reference">
                            Reference
                          </span>
                        )}
                        <button
                          type="button"
                          className="note-pin-button"
                          disabled={pinningNoteId === note.id}
                          onClick={() => handleTogglePin(note)}
                        >
                          {note.isPinned ? "Unpin" : "Pin"}
                        </button>
                      </div>

                      <button
                        type="button"
                        className="note-card-main"
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <div className="note-card-topline">
                          <span>{note.project?.name || "General"}</span>
                          <span>{formatDate(note.updatedAt)}</span>
                        </div>
                        <strong>{note.title}</strong>
                        <p>{getSnippet(note.content)}</p>
                        <div className="note-card-footer">
                          By {getCreatorName(note)}
                        </div>
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="notes-list-section">
              <div className="dashboard-eyebrow">
                {pinnedNotes.length > 0 ? "Notes" : "All Notes"}
              </div>
              <div className="note-card-grid">
                {regularNotes.map((note) => (
                  <article
                    key={note.id}
                    className={
                      note.id === selectedNoteId
                        ? `note-card ${note.kind === "REFERENCE" ? "reference active" : "active"}`
                        : note.kind === "REFERENCE"
                          ? "note-card reference"
                          : "note-card"
                    }
                  >
                    <div className="note-card-actions">
                      {note.kind === "REFERENCE" && (
                        <span className="note-kind-pill reference">
                          Reference
                        </span>
                      )}
                      <button
                        type="button"
                        className="note-pin-button"
                        disabled={pinningNoteId === note.id}
                        onClick={() => handleTogglePin(note)}
                      >
                        {note.isPinned ? "Unpin" : "Pin"}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="note-card-main"
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <div className="note-card-topline">
                        <span>{note.project?.name || "General"}</span>
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                      <strong>{note.title}</strong>
                      <p>{getSnippet(note.content)}</p>
                      <div className="note-card-footer">
                        By {getCreatorName(note)}
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="note-panel note-detail-panel">
        {selectedNote ? (
          <>
            <div className="note-panel-header">
              <div>
                <div className="dashboard-eyebrow">Note Detail</div>
                <h4>{selectedNote.title}</h4>
              </div>

              <button
                type="button"
                className="note-pin-button"
                disabled={pinningNoteId === selectedNote.id}
                onClick={() => handleTogglePin(selectedNote)}
              >
                {selectedNote.isPinned ? "Unpin note" : "Pin note"}
              </button>
            </div>

            <div className="note-detail-meta">
              {selectedNote.isPinned && <span>Pinned</span>}
              {selectedNote.kind === "REFERENCE" && <span>Reference</span>}
              <span>{selectedNote.project?.name || "General note"}</span>
              <span>Updated {formatDate(selectedNote.updatedAt)}</span>
              <span>By {getCreatorName(selectedNote)}</span>
            </div>

            <form className="note-form" onSubmit={handleUpdateNote}>
              <label className="form-label">
                Title
                <input
                  className="ui-input"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                />
              </label>

              <label className="form-label">
                Type
                <select
                  className="ui-input"
                  value={editKind}
                  onChange={(event) => setEditKind(event.target.value)}
                >
                  <option value="NOTE">Note</option>
                  <option value="REFERENCE">Reference</option>
                </select>
              </label>

              <label className="form-label">
                Project link
                <select
                  className="ui-input"
                  value={editProjectId}
                  onChange={(event) => setEditProjectId(event.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Content
                <textarea
                  className="ui-textarea note-content-editor"
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={10}
                />
              </label>

              <div className="button-row">
                <button
                  type="submit"
                  className="ui-button ui-button-dark"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save note"}
                </button>
                <button
                  type="button"
                  className="ui-button ui-button-danger"
                  disabled={deleting}
                  onClick={handleDeleteNote}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="org-empty-state">
            <h4>Select a note</h4>
            <p>Note details and editing controls will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
