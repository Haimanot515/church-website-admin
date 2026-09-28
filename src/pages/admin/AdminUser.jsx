import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../api/api";
import { useTranslation } from "react-i18next";
import ActionMenu from "../../components/ActionMenu";
import "./AdminUsers.css";

const PAGE_SIZE = 20;

const AdminUsers = ({ mode }) => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [editingRowId, setEditingRowId] = useState(null);
  const [rowDraft, setRowDraft] = useState({});
  const [rowBusyId, setRowBusyId] = useState(null);

  // Infinite scroll: pages are appended as the user scrolls down.
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);
  const hasMore = users.length < totalUsers;

  const fetchUsersPage = async (page = 1, { append = false } = {}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const res = await API.get(`/admin/users?page=${page}&limit=${PAGE_SIZE}`);
      const incoming = res.data.users || [];
      setUsers((prev) => {
        if (!append) return incoming;
        const seen = new Set(prev.map((u) => u.id));
        return [...prev, ...incoming.filter((u) => !seen.has(u.id))];
      });
      setTotalUsers(res.data.totalUsers);
      setCurrentPage(page);
    } catch (err) {
      setError(t("adminUsers.errors.fetchUsers"));
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload everything that is currently shown (used after a delete / update).
  const refreshUsers = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const pages = Math.max(1, currentPage);
      let all = [];
      let total = 0;
      for (let p = 1; p <= pages; p++) {
        const res = await API.get(`/admin/users?page=${p}&limit=${PAGE_SIZE}`);
        all = all.concat(res.data.users || []);
        total = res.data.totalUsers;
      }
      setUsers(all);
      setTotalUsers(total);
    } catch {
      setError(t("adminUsers.errors.fetchUsers"));
    } finally {
      loadingRef.current = false;
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingRef.current) fetchUsersPage(currentPage + 1, { append: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await API.get(`/admin/users/?search=${searchQuery}`);
      if (res.data.users.length > 0) {
        const user = res.data.users[0];
        setSearchResult(user);
        setEditUser({
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          phone: user.phone || "",
          address: user.address || "",
        });
        setEditMode(true);
      } else {
        alert(t("adminUsers.alerts.noUserFound"));
      }
    } catch {
      setError(t("adminUsers.errors.search"));
    }
  };

  const handleUpdate = async () => {
    if (!searchResult) return;
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    await API.put(`/admin/users/${searchResult.id}`, editUser);
    alert(t("adminUsers.alerts.userUpdated"));
    setSearchQuery("");
    setSearchResult(null);
    setEditMode(false);
    refreshUsers();
  };

  const handleDelete = async () => {
    if (!searchResult) return;
    if (!window.confirm(t("adminUsers.alerts.confirmDelete"))) return;
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    await API.delete(`/admin/delete/${searchResult.id}`);
    alert(t("adminUsers.alerts.userDeleted"));
    setSearchQuery("");
    setSearchResult(null);
    setEditMode(false);
    refreshUsers();
  };

  const startRowEdit = (user) => {
    setEditingRowId(user.id);
    setRowDraft({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
    });
  };

  const cancelRowEdit = () => {
    setEditingRowId(null);
    setRowDraft({});
  };

  const saveRowEdit = async (user) => {
    try {
      setRowBusyId(user.id);
      await API.put(`/admin/users/${user.id}`, rowDraft);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...rowDraft } : u))
      );
      setEditingRowId(null);
      setRowDraft({});
    } catch {
      alert(t("adminUsers.errors.fetchUsers"));
    } finally {
      setRowBusyId(null);
    }
  };

  const deleteRowUser = async (user) => {
    if (!window.confirm(t("adminUsers.alerts.confirmDelete"))) return;
    try {
      setRowBusyId(user.id);
      await API.delete(`/admin/delete/${user.id}`);
      alert(t("adminUsers.alerts.userDeleted"));
      refreshUsers();
    } catch {
      alert(t("adminUsers.errors.fetchUsers"));
    } finally {
      setRowBusyId(null);
    }
  };

  const toggleAdminRow = async (user) => {
    const nextIsAdmin = !(user.isAdmin === true || user.isAdmin === "true");
    try {
      setRowBusyId(user.id);
      await API.put(`/admin/users/${user.id}`, { isAdmin: nextIsAdmin });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isAdmin: nextIsAdmin } : u))
      );
      alert(t("adminUsers.alerts.roleUpdated"));
    } catch {
      alert(t("adminUsers.errors.fetchUsers"));
    } finally {
      setRowBusyId(null);
    }
  };

  const toggleActiveRow = async (user) => {
    const targetIsActive = !(user.isActive === false || user.isActive === "false") ? false : true;
    try {
      setRowBusyId(user.id);
      await API.put(`/admin/users/${user.id}`, { isActive: targetIsActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: targetIsActive } : u))
      );
      alert(t("adminUsers.alerts.statusUpdated"));
    } catch {
      alert(t("adminUsers.errors.fetchUsers"));
    } finally {
      setRowBusyId(null);
    }
  };

  useEffect(() => {
    fetchUsersPage(1);
  }, []);

  // Load the next page when the sentinel at the bottom of the list comes into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore, users.length]);

  return (
    <div className="admin-users-page">

      {/* ================= VIEW USERS ================= */}
      {mode === "/admin/users/view" && (
        <div className="au-card">
          <h1 className="au-title">{t("adminUsers.view.welcome")}</h1>
          <h2 className="au-subtitle">{t("adminUsers.view.totalUsers", { count: totalUsers })}</h2>

          {error && <p className="au-error">{error}</p>}

          {loading && users.length === 0 ? (
            <p className="au-loading">{t("adminUsers.view.loading")}</p>
          ) : (
            <>
              <div className="au-table-wrap">
                <table className="au-table">
                  <thead>
                    <tr>
                      <th>{t("adminUsers.view.table.name")}</th>
                      <th>{t("adminUsers.view.table.email")}</th>
                      <th>{t("adminUsers.view.table.admin")}</th>
                      <th>{t("adminUsers.view.table.status")}</th>
                      <th>{t("adminUsers.view.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isAdmin = u.isAdmin === true || u.isAdmin === "true";
                      const isActive = !(u.isActive === false || u.isActive === "false");
                      const isEditingRow = editingRowId === u.id;
                      const isBusy = rowBusyId === u.id;

                      return (
                        <tr key={u.id}>
                          <td data-label={t("adminUsers.view.table.name")}>
                            {isEditingRow ? (
                              <input
                                className="au-edit-input"
                                value={rowDraft.name}
                                onChange={(e) => setRowDraft({ ...rowDraft, name: e.target.value })}
                              />
                            ) : (
                              u.name
                            )}
                          </td>
                          <td data-label={t("adminUsers.view.table.email")}>
                            {isEditingRow ? (
                              <input
                                className="au-edit-input"
                                value={rowDraft.email}
                                onChange={(e) => setRowDraft({ ...rowDraft, email: e.target.value })}
                              />
                            ) : (
                              u.email
                            )}
                          </td>
                          <td
                            data-label={t("adminUsers.view.table.admin")}
                            className={isAdmin ? "au-role-yes" : "au-role-no"}
                          >
                            {isAdmin ? t("adminUsers.view.table.yes") : t("adminUsers.view.table.no")}
                          </td>
                          <td
                            data-label={t("adminUsers.view.table.status")}
                            className={isActive ? "au-status-active" : "au-status-inactive"}
                          >
                            {isActive ? t("adminUsers.view.table.active") : t("adminUsers.view.table.inactive")}
                          </td>
                          <td data-label={t("adminUsers.view.table.actions")}>
                            <div className="au-actions">
                              {isEditingRow ? (
                                <>
                                  <button
                                    className="au-btn au-btn-save"
                                    disabled={isBusy}
                                    onClick={() => saveRowEdit(u)}
                                  >
                                    {t("adminUsers.view.save")}
                                  </button>
                                  <button
                                    className="au-btn au-btn-cancel"
                                    disabled={isBusy}
                                    onClick={cancelRowEdit}
                                  >
                                    {t("adminUsers.view.cancel")}
                                  </button>
                                </>
                              ) : (
                                <ActionMenu
                                  items={[
                                    {
                                      label: t("adminUsers.view.edit"),
                                      onClick: () => startRowEdit(u),
                                      tone: "edit",
                                      disabled: isBusy,
                                    },
                                    {
                                      label: isAdmin
                                        ? t("adminUsers.view.removeAdmin")
                                        : t("adminUsers.view.makeAdmin"),
                                      onClick: () => toggleAdminRow(u),
                                      tone: isAdmin ? "warning" : "success",
                                      disabled: isBusy,
                                    },
                                    {
                                      label: isActive
                                        ? t("adminUsers.view.makeInactive")
                                        : t("adminUsers.view.makeActive"),
                                      onClick: () => toggleActiveRow(u),
                                      tone: isActive ? "warning" : "success",
                                      disabled: isBusy,
                                    },
                                    {
                                      label: t("adminUsers.view.delete"),
                                      onClick: () => deleteRowUser(u),
                                      tone: "delete",
                                      disabled: isBusy,
                                    },
                                  ]}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Infinite-scroll sentinel */}
              <div ref={sentinelRef} className="au-load-more" aria-hidden={!hasMore}>
                {loadingMore && t("adminUsers.view.loading")}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= DELETE USERS (unchanged, separate mode) ================= */}
      {mode === "/admin/users/delete" && (
        <div className="au-search-panel">
          <h3>{t("adminUsers.delete.heading")}</h3>
          <input
            className="au-search-input"
            placeholder={t("adminUsers.delete.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <br /><br />
          <button
            className="au-search-btn"
            style={{ background: "#dc2626" }}
            onClick={handleSearch}
          >
            {t("adminUsers.delete.search")}
          </button>

          {editMode && searchResult && (
            <>
              <h4>{t("adminUsers.delete.userFound", { name: searchResult.name })}</h4>
              <button
                className="au-search-btn"
                style={{ background: "#b91c1c" }}
                onClick={handleDelete}
              >
                {t("adminUsers.delete.deleteUser")}
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= UPDATE USERS (unchanged, separate mode) ================= */}
      {mode === "/admin/users/update" && (
        <div className="au-search-panel">
          <h3>{t("adminUsers.update.heading")}</h3>

          <input
            className="au-search-input"
            placeholder={t("adminUsers.update.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <br /><br />
          <button
            className="au-search-btn"
            style={{ background: "#16a34a" }}
            onClick={handleSearch}
          >
            {t("adminUsers.update.search")}
          </button>

          {editUser && searchResult && (
            <div className="au-edit-form">
              <h4 style={{ width: "100%" }}>{t("adminUsers.update.userFound", { name: searchResult.name })}</h4>

              <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} placeholder={t("adminUsers.update.namePlaceholder")} />
              <input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} placeholder={t("adminUsers.update.emailPlaceholder")} />

              <select value={String(editUser.isAdmin)} onChange={(e) => setEditUser({ ...editUser, isAdmin: e.target.value })}>
                <option value="true">{t("adminUsers.update.roleAdmin")}</option>
                <option value="false">{t("adminUsers.update.roleUser")}</option>
              </select>

              <input value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} placeholder={t("adminUsers.update.phonePlaceholder")} />
              <input value={editUser.address} onChange={(e) => setEditUser({ ...editUser, address: e.target.value })} placeholder={t("adminUsers.update.addressPlaceholder")} />

              <div style={{ width: "100%" }}>
                <button
                  style={{ marginTop: "10px", padding: "12px 20px", borderRadius: "10px", background: "#2563eb", color: "#fff", border: "none" }}
                  onClick={handleUpdate}
                >
                  {t("adminUsers.update.updateUser")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;