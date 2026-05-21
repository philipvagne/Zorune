import { useEffect, useMemo, useState } from "react";
import {
  addOrganizationMember,
  createOrganization,
  getMyOrganizations,
  getOrganizationMembers,
} from "../../api";

const manageableRoles = ["OWNER", "ADMIN"];

const displayUserName = (user) =>
  user?.fullName || user?.username || user?.email || "Unknown user";

export default function OrganizationsWorkspace({ token }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [memberLookup, setMemberLookup] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState("");

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === selectedOrgId
      ) || null,
    [organizations, selectedOrgId]
  );

  const canManageSelectedOrganization =
    selectedOrganization &&
    manageableRoles.includes(selectedOrganization.role);

  useEffect(() => {
    let isMounted = true;

    const loadOrganizations = async () => {
      setLoadingOrganizations(true);
      setError("");

      try {
        const res = await getMyOrganizations(token);

        if (!isMounted) return;

        setOrganizations(res.data);
        setSelectedOrgId((currentId) => {
          if (
            currentId &&
            res.data.some((organization) => organization.id === currentId)
          ) {
            return currentId;
          }

          return res.data[0]?.id || null;
        });
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message ||
            "Could not load your organizations."
        );
      } finally {
        if (isMounted) {
          setLoadingOrganizations(false);
        }
      }
    };

    loadOrganizations();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!selectedOrgId) {
        setMembers([]);
        return;
      }

      setLoadingMembers(true);
      setError("");

      try {
        const res = await getOrganizationMembers(token, selectedOrgId);

        if (isMounted) {
          setMembers(res.data);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message ||
            "Could not load organization members."
        );
      } finally {
        if (isMounted) {
          setLoadingMembers(false);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [selectedOrgId, token]);

  const handleCreateOrganization = async (event) => {
    event.preventDefault();

    const trimmedName = organizationName.trim();

    if (!trimmedName) {
      setError("Organization name is required.");
      return;
    }

    setCreatingOrganization(true);
    setError("");

    try {
      const payload = {
        name: trimmedName,
      };

      if (organizationSlug.trim()) {
        payload.slug = organizationSlug.trim();
      }

      const res = await createOrganization(token, payload);
      const createdOrganization = res.data;

      setOrganizations((current) => [...current, createdOrganization]);
      setSelectedOrgId(createdOrganization.id);
      setOrganizationName("");
      setOrganizationSlug("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not create organization."
      );
    } finally {
      setCreatingOrganization(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    const lookup = memberLookup.trim();

    if (!lookup || !selectedOrgId) {
      setError("Email or username is required.");
      return;
    }

    setAddingMember(true);
    setError("");

    try {
      const res = await addOrganizationMember(token, selectedOrgId, {
        emailOrUsername: lookup,
        role: memberRole,
      });

      setMembers((current) => [...current, res.data]);
      setMemberLookup("");
      setMemberRole("MEMBER");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member.");
    } finally {
      setAddingMember(false);
    }
  };

  if (loadingOrganizations) {
    return <div className="workspace-placeholder">Loading organizations...</div>;
  }

  return (
    <div className="org-workspace">
      {error ? <div className="form-error org-error">{error}</div> : null}

      <section className="org-panel">
        <div className="org-panel-header">
          <div>
            <div className="dashboard-eyebrow">Workspace</div>
            <h4>Your organizations</h4>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="org-empty-state">
            <h4>No organization yet</h4>
            <p>
              Create an organization to start grouping members, projects, and
              task workspaces.
            </p>
          </div>
        ) : (
          <div className="org-list">
            {organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                className={`org-list-item ${
                  organization.id === selectedOrgId ? "active" : ""
                }`}
                onClick={() => setSelectedOrgId(organization.id)}
              >
                <span>{organization.name}</span>
                <span className="role-pill">{organization.role}</span>
              </button>
            ))}
          </div>
        )}

        <form
          className="org-form"
          onSubmit={handleCreateOrganization}
        >
          <label className="form-label">
            Organization name
            <input
              className="ui-input"
              value={organizationName}
              onChange={(event) =>
                setOrganizationName(event.target.value)
              }
              placeholder="Acme Operations"
            />
          </label>

          <label className="form-label">
            Slug optional
            <input
              className="ui-input"
              value={organizationSlug}
              onChange={(event) =>
                setOrganizationSlug(event.target.value)
              }
              placeholder="acme-operations"
            />
          </label>

          <button
            type="submit"
            className="ui-button ui-button-primary full-width"
            disabled={creatingOrganization}
          >
            {creatingOrganization ? "Creating..." : "Create organization"}
          </button>
        </form>
      </section>

      <section className="org-panel org-members-panel">
        {selectedOrganization ? (
          <>
            <div className="org-panel-header">
              <div>
                <div className="dashboard-eyebrow">Members</div>
                <h4>{selectedOrganization.name}</h4>
              </div>
              <span className="role-pill">{selectedOrganization.role}</span>
            </div>

            {loadingMembers ? (
              <div className="muted-text">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="muted-text">No members found.</div>
            ) : (
              <div className="member-list">
                {members.map((membership) => (
                  <div
                    key={membership.id}
                    className="member-row"
                  >
                    <div>
                      <div className="member-name">
                        {displayUserName(membership.user)}
                      </div>
                      <div className="member-meta">
                        {membership.user?.username
                          ? `@${membership.user.username}`
                          : "No username"}{" "}
                        - {membership.user?.email}
                      </div>
                    </div>
                    <span className="role-pill">{membership.role}</span>
                  </div>
                ))}
              </div>
            )}

            {canManageSelectedOrganization ? (
              <form
                className="org-form"
                onSubmit={handleAddMember}
              >
                <label className="form-label">
                  Add existing user
                  <input
                    className="ui-input"
                    value={memberLookup}
                    onChange={(event) =>
                      setMemberLookup(event.target.value)
                    }
                    placeholder="email@example.com or username"
                  />
                </label>

                <label className="form-label">
                  Role
                  <select
                    className="ui-input"
                    value={memberRole}
                    onChange={(event) =>
                      setMemberRole(event.target.value)
                    }
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="ui-button ui-button-dark"
                  disabled={addingMember}
                >
                  {addingMember ? "Adding..." : "Add member"}
                </button>
              </form>
            ) : (
              <div className="muted-text">
                Only organization owners and admins can add members.
              </div>
            )}
          </>
        ) : (
          <div className="org-empty-state">
            <h4>Create an organization first</h4>
            <p>
              Members and shared user search become available after your
              account belongs to an organization.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
