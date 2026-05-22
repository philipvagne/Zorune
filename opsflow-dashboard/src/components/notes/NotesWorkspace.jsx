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
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) || null,
    [organizations, selectedOrgId]
  );
  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
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
      } catch (err) {
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
      } catch (err) {
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
  }, [search, selectedOrgId, setSelectedNoteId, token]);

  useEffect(() => {
    setEditTitle(selectedNote?.title || "");
    setEditContent(selectedNote?.content || "");
    setEditProjectId(selectedNote?.projectId || "");
  }, [selectedNote]);

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
      });

      const createdNote = res.data;
      setNotes((current) => [createdNote, ...current]);
      setSelectedNoteId(createdNote.id);
      setNewTitle("");
      setNewContent("");
      setNewProjectId("");
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
      });

      const updatedNote = res.data;
      setNotes((current) =>
        current.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
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

            <form className="note-form" onSubmit={handleCreateNote}>
              <label className="form-label">
                New note
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
                {creating ? "Creating..." : "Create note"}
              </button>
            </form>
          </>
        )}
      </section>

      <section className="note-panel note-list-panel">
        {loadingNotes ? (
          <div className="workspace-placeholder">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="org-empty-state">
            <h4>No notes found</h4>
            <p>Operational notes for this organization will appear here.</p>
          </div>
        ) : (
          <div className="note-card-grid">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={
                  note.id === selectedNoteId
                    ? "note-card active"
                    : "note-card"
                }
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
            ))}
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
            </div>

            <div className="note-detail-meta">
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
