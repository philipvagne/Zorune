import { useEffect, useMemo, useState } from "react";
import {
  addNoteLink,
  createNote,
  deleteNote,
  getNoteLinks,
  getMyOrganizations,
  getNotes,
  getOrganizationProjects,
  removeNoteLink,
  updateNote,
} from "../../api";
import usePersistentState from "../../hooks/usePersistentState";
import { subscribeToNoteCreated } from "../../lib/noteEvents";

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

const getSearchableText = (note) => {
  const outgoingLinks =
    note.sourceLinks
      ?.map((link) =>
        [
          link.targetNote?.title,
          link.targetNote?.kind,
          link.targetNote?.project?.name,
          link.targetNote?.task?.title,
        ]
          .filter(Boolean)
          .join(" ")
      )
      .join(" ") || "";

  const incomingLinks =
    note.targetLinks
      ?.map((link) =>
        [
          link.sourceNote?.title,
          link.sourceNote?.kind,
          link.sourceNote?.project?.name,
          link.sourceNote?.task?.title,
        ]
          .filter(Boolean)
          .join(" ")
      )
      .join(" ") || "";

  return [
    note.title || "",
    note.content || "",
    note.kind || "",
    note.project?.name || "",
    note.task?.title || "",
    outgoingLinks,
    incomingLinks,
  ]
    .join(" ")
    .toLowerCase();
};

const renderHighlightedText = (text, query) => {
  if (!query.trim()) {
    return text;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.trim().length);
  const after = text.slice(index + query.trim().length);

  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  );
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

  return getSearchableText(note).includes(query);
};

export default function NotesWorkspace({ token }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = usePersistentState(
    "opsflow.notes.selectedOrgId",
    ""
  );
  const [projects, setProjects] = useState([]);
  const [organizationNotes, setOrganizationNotes] = useState([]);
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
  const [newKind, setNewKind] = useState("NOTE");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editKind, setEditKind] = useState("NOTE");
  const [linkedNotes, setLinkedNotes] = useState([]);
  const [linkQuery, setLinkQuery] = useState("");
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinningNoteId, setPinningNoteId] = useState(null);
  const [linkingNoteId, setLinkingNoteId] = useState(null);
  const [unlinkingNoteId, setUnlinkingNoteId] = useState(null);
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");

  const selectedNote = useMemo(
    () => organizationNotes.find((note) => note.id === selectedNoteId) || null,
    [organizationNotes, selectedNoteId]
  );
  const sortedNotes = useMemo(
    () => [...organizationNotes].sort(compareNotes),
    [organizationNotes]
  );
  const visibleNotes = useMemo(() => {
    return sortedNotes.filter((note) => matchesNoteSearch(note, search));
  }, [search, sortedNotes]);
  const pinnedNotes = useMemo(
    () => visibleNotes.filter((note) => note.isPinned),
    [visibleNotes]
  );
  const regularNotes = useMemo(
    () => visibleNotes.filter((note) => !note.isPinned),
    [visibleNotes]
  );
  const linkableNotes = useMemo(() => {
    const linkedIds = new Set(linkedNotes.map((note) => note.id));
    return organizationNotes
      .filter((note) => note.id !== selectedNoteId)
      .filter((note) => !linkedIds.has(note.id))
      .filter((note) => matchesNoteSearch(note, linkQuery))
      .slice(0, 8);
  }, [linkQuery, linkedNotes, organizationNotes, selectedNoteId]);
  const matchingCount = visibleNotes.length;
  const selectedNoteVisible = Boolean(
    selectedNoteId && visibleNotes.some((note) => note.id === selectedNoteId)
  );

  const upsertOrganizationNote = (nextNote) => {
    setOrganizationNotes((current) => {
      const exists = current.some((note) => note.id === nextNote.id);

      if (exists) {
        return current
          .map((note) => (note.id === nextNote.id ? nextNote : note))
          .sort(compareNotes);
      }

      return [nextNote, ...current].sort(compareNotes);
    });
  };

  const upsertOrganizationNotes = (...nextNotes) => {
    nextNotes.filter(Boolean).forEach((note) => {
      upsertOrganizationNote(note);
    });
  };

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
    const resetWorkspaceData = () => {
      setProjects([]);
      setOrganizationNotes([]);
      setSelectedNoteId("");
    };

    if (!selectedOrgId) {
      resetWorkspaceData();
      return;
    }

    let active = true;

    const loadWorkspaceData = async () => {
      setLoadingNotes(true);
      setError("");

      try {
        const [projectsRes, allNotesRes] = await Promise.all([
          getOrganizationProjects(token, selectedOrgId),
          getNotes(token, {
            organizationId: selectedOrgId,
          }),
        ]);

        if (!active) return;

        const nextProjects = projectsRes.data || [];
        const nextOrganizationNotes = allNotesRes.data || [];
        setProjects(nextProjects);
        setOrganizationNotes(nextOrganizationNotes);
        setSelectedNoteId((currentId) =>
          nextOrganizationNotes.some((note) => note.id === currentId)
            ? currentId
            : nextOrganizationNotes[0]?.id || ""
        );
      } catch {
        if (active) {
          setProjects([]);
          setOrganizationNotes([]);
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
  }, [selectedOrgId, setSelectedNoteId, token]);

  useEffect(() => {
    const syncSelectedNoteState = () => {
      setEditTitle(selectedNote?.title || "");
      setEditContent(selectedNote?.content || "");
      setEditProjectId(selectedNote?.projectId || "");
      setEditKind(selectedNote?.kind || "NOTE");
      setLinkQuery("");
      setLinkError("");
    };

    syncSelectedNoteState();
  }, [selectedNote]);

  useEffect(() => {
    const clearLinkedNoteState = () => {
      setLinkedNotes([]);
    };

    if (!selectedNoteId) {
      clearLinkedNoteState();
      return;
    }

    let active = true;

    const loadLinkedNotes = async () => {
      setLoadingLinks(true);
      setLinkError("");

      try {
        const res = await getNoteLinks(token, selectedNoteId);

        if (!active) return;

        setLinkedNotes(res.data || []);
      } catch (err) {
        if (active) {
          setLinkedNotes([]);
          setLinkError(
            err.response?.data?.message || "Could not load linked notes."
          );
        }
      } finally {
        if (active) {
          setLoadingLinks(false);
        }
      }
    };

    loadLinkedNotes();

    return () => {
      active = false;
    };
  }, [selectedNoteId, token]);

  useEffect(() => {
    return subscribeToNoteCreated((note) => {
      if (note.organizationId !== selectedOrgId) {
        return;
      }

      upsertOrganizationNote(note);
    });
  }, [selectedOrgId]);

  const updateNoteInState = (noteId, updater) => {
    setOrganizationNotes((current) =>
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
      upsertOrganizationNote(createdNote);
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
      upsertOrganizationNote(updatedNote);
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
      setOrganizationNotes((current) =>
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

  const handleAddLink = async (linkedNote) => {
    if (!selectedNoteId) {
      return;
    }

    setLinkingNoteId(linkedNote.id);
    setLinkError("");

    try {
      const res = await addNoteLink(token, selectedNoteId, linkedNote.id);
      const { linkedNote: linkedNoteState, sourceNote } = res.data;
      setLinkedNotes((current) =>
        [...current.filter((note) => note.id !== linkedNoteState.id), linkedNoteState].sort(
          compareNotes
        )
      );
      upsertOrganizationNotes(sourceNote, linkedNoteState);
      setLinkQuery("");
    } catch (err) {
      setLinkError(err.response?.data?.message || "Could not link note.");
    } finally {
      setLinkingNoteId(null);
    }
  };

  const handleRemoveLink = async (linkedNoteId) => {
    if (!selectedNoteId) {
      return;
    }

    setUnlinkingNoteId(linkedNoteId);
    setLinkError("");

    try {
      const res = await removeNoteLink(token, selectedNoteId, linkedNoteId);
      setLinkedNotes((current) =>
        current.filter((note) => note.id !== linkedNoteId)
      );
      upsertOrganizationNotes(res.data?.sourceNote, res.data?.linkedNote);
    } catch (err) {
      setLinkError(err.response?.data?.message || "Could not unlink note.");
    } finally {
      setUnlinkingNoteId(null);
    }
  };

  const handleSelectLinkedNote = (linkedNote) => {
    setSelectedNoteId(linkedNote.id);
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
              <h4>Shared context</h4>
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

            <div className="notes-search-summary">
              {matchingCount === 0
                ? "No matching operational notes"
                : `${matchingCount} matching ${
                    matchingCount === 1 ? "note" : "notes"
                  }`}
              {!selectedNoteVisible && selectedNote ? " - current note still open" : ""}
            </div>

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

              <label className="form-label">
                Type
                <select
                  className="ui-input"
                  value={newKind}
                  onChange={(event) => setNewKind(event.target.value)}
                >
                  <option value="NOTE">Note</option>
                  <option value="REFERENCE">Reference</option>
                </select>
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
        ) : visibleNotes.length === 0 ? (
          <div className="org-empty-state">
            <h4>This space is quiet right now</h4>
            <p>Notes and references for this organization will gather here.</p>
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
                        <strong>{renderHighlightedText(note.title, search)}</strong>
                        <p>{renderHighlightedText(getSnippet(note.content), search)}</p>
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
                      <strong>{renderHighlightedText(note.title, search)}</strong>
                      <p>{renderHighlightedText(getSnippet(note.content), search)}</p>
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
                <div className="dashboard-eyebrow">Note</div>
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
              {selectedNote.task?.title ? (
                <span>Task: {selectedNote.task.title}</span>
              ) : null}
              <span>Updated {formatDate(selectedNote.updatedAt)}</span>
              <span>By {getCreatorName(selectedNote)}</span>
            </div>

            <details className="note-links-section">
              <summary className="note-links-header">
                <strong>Linked context</strong>
                <span className="muted-text">
                  {loadingLinks
                    ? "Loading..."
                    : linkedNotes.length === 0
                      ? "None"
                      : `${linkedNotes.length} connected`}
                </span>
              </summary>

              <div className="note-links-body">
                <label className="form-label">
                  Link another note
                  <input
                    className="ui-input"
                    value={linkQuery}
                    onChange={(event) => setLinkQuery(event.target.value)}
                    placeholder="Search title, content, or kind..."
                  />
                </label>

                {linkError ? <div className="form-error">{linkError}</div> : null}

                {linkQuery.trim() ? (
                  <div className="linked-note-picker">
                    {linkableNotes.length === 0 ? (
                      <div className="muted-text">
                        No matching notes available to link
                      </div>
                    ) : (
                      linkableNotes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          className="linked-note-picker-item"
                          onClick={() => handleAddLink(note)}
                          disabled={linkingNoteId === note.id}
                        >
                          <div>
                            <strong>{note.title}</strong>
                            <div className="muted-text">
                              {note.kind === "REFERENCE" ? "Reference" : "Note"}
                              {" - "}
                              {note.project?.name || "General"}
                            </div>
                          </div>
                          <span>
                            {linkingNoteId === note.id ? "Linking..." : "Link"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}

                <div className="linked-notes-list">
                  {loadingLinks ? (
                    <div className="muted-text">Loading linked notes...</div>
                  ) : linkedNotes.length === 0 ? (
                    <div className="muted-text">
                      No linked context yet
                    </div>
                  ) : (
                    linkedNotes.map((note) => (
                      <div key={note.id} className="linked-note-card">
                        <button
                          type="button"
                          className="linked-note-main"
                          onClick={() => handleSelectLinkedNote(note)}
                        >
                          <div className="note-card-topline">
                            <span>{note.project?.name || "General"}</span>
                            <span>{formatDate(note.updatedAt)}</span>
                          </div>
                          <strong>{note.title}</strong>
                          <p>{getSnippet(note.content)}</p>
                          <div className="linked-note-meta">
                            {note.task?.title ? (
                              <span>Task: {note.task.title}</span>
                            ) : null}
                            {note.project?.name ? (
                              <span>Project: {note.project.name}</span>
                            ) : null}
                            {note.isPinned ? <span>Pinned</span> : null}
                          </div>
                        </button>

                        <div className="linked-note-actions">
                          {note.kind === "REFERENCE" && (
                            <span className="note-kind-pill reference">
                              Reference
                            </span>
                          )}
                          <button
                            type="button"
                            className="note-pin-button"
                            onClick={() => handleRemoveLink(note.id)}
                            disabled={unlinkingNoteId === note.id}
                          >
                            {unlinkingNoteId === note.id ? "Removing..." : "Unlink"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </details>

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
            <h4>Open a note</h4>
            <p>Details and edits stay here while the rest of the workspace keeps moving.</p>
          </div>
        )}
      </section>
    </div>
  );
}

