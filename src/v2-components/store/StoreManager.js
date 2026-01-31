// src/components/Store/StoreManager.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Box, Pagination, Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import TextInput from "./../../utility-v1/TextInput";
import SelectBox from "./../../utility-v1/SelectBox";
import ModalBox from "./../../utility-v1/ModalBox";
import CustomDrawer from "./../../utility-v1/CustomDrawer";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { API_BASE_URL } from "../../config/constants";

dayjs.extend(localizedFormat);

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const emptyForm = {
  slug: "",
  name: "",
  display_name: "",
  email: "",
  phone: "",
  website: "",
  status: "ACTIVE",
  settings: "{}", // JSON string in UI
};

export default function StoreManager() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer (optional JSON editor)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = (open) => () => setIsDrawerOpen(open);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const isEditing = editingId !== null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await axios.get(`${API_BASE_URL}/stores`);
      setStores(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Failed to fetch stores.");
    } finally {
      setLoading(false);
    }
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    if (!form.slug || !SLUG_RE.test(form.slug.trim()))
      return "Invalid slug. Use lowercase letters, digits, '-' or '_'.";
    if (!form.name.trim()) return "Name is required.";

    if (form.settings) {
      try {
        const obj =
          typeof form.settings === "string"
            ? JSON.parse(form.settings)
            : form.settings;
        if (typeof obj !== "object" || Array.isArray(obj))
          return "Settings must be a JSON object.";
      } catch {
        return "Settings must be valid JSON.";
      }
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr("");

    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      display_name: form.display_name || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      status: (form.status || "ACTIVE").toUpperCase(),
      settings: form.settings ? JSON.parse(form.settings) : {},
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/stores/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/stores`, payload);
      }
      await load();
      onReset();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        (isEditing ? "Update failed." : "Create failed.");
      setErr(msg);
    }
  }

  function onEdit(row) {
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      name: row.name,
      display_name: row.display_name || "",
      email: row.email || "",
      phone: row.phone || "",
      website: row.website || "",
      status: row.status || "ACTIVE",
      settings: JSON.stringify(row.settings || {}, null, 2),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this store?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/stores/${id}`);
      await load();
      if (editingId === id) onReset();
    } catch (e) {
      const msg = e?.response?.data?.error || "Delete failed.";
      setErr(msg);
    }
  }

  function onReset() {
    setEditingId(null);
    setForm(emptyForm);
    setErr("");
  }

  // Filters + pagination
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return stores.filter((st) => {
      const matchesSearch =
        !s ||
        st.slug?.toLowerCase().includes(s) ||
        st.name?.toLowerCase().includes(s) ||
        st.display_name?.toLowerCase().includes(s);
      const matchesStatus = !statusFilter || st.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stores, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // reset page when filters change
    setPage(1);
  }, [search, statusFilter]);

  const GridCol = { xs: 12, md: 6 };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Form */}
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          p: 2,
          mb: 3,
          background: "#fafafa",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={GridCol}>
            <TextInput
              label="Slug *"
              name="slug"
              placeholder="illolam"
              value={form.slug}
              onChange={(e) =>
                setField("slug", e.target.value.toLowerCase().trim())
              }
              helperText="Lowercase; letters, digits, - and _"
            />
          </Grid>
          <Grid size={GridCol}>
            <TextInput
              label="Name *"
              name="name"
              placeholder="Illolam"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </Grid>

          <Grid size={GridCol}>
            <TextInput
              label="Display Name"
              name="display_name"
              placeholder="Illolam Jewels"
              value={form.display_name}
              onChange={(e) => setField("display_name", e.target.value)}
            />
          </Grid>
          <Grid size={GridCol}>
            <SelectBox
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              options={statusOptions}
            />
          </Grid>

          <Grid size={GridCol}>
            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="support@domain.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </Grid>
          <Grid size={GridCol}>
            <TextInput
              label="Phone"
              name="phone"
              placeholder="+91..."
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </Grid>

          <Grid size={GridCol}>
            <TextInput
              label="Website"
              name="website"
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
            />
          </Grid>

          <Grid size={GridCol}>
            <TextInput
              label="Settings (JSON)"
              name="settings"
              value={form.settings}
              onChange={(e) => setField("settings", e.target.value)}
              multiline
              rows={6}
            />
          </Grid>

          {err && (
            <Grid size={{ xs: 12 }}>
              <Typography color="error" sx={{ mt: 1 }}>
                {err}
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }} sx={{ textAlign: "center", mt: 1 }}>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              size="large"
            >
              {isEditing ? "Update Store" : "Create Store"}
            </Button>
            {isEditing && (
              <>
                &nbsp;&nbsp;&nbsp;
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={onReset}
                >
                  Cancel
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextInput
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by slug or name"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectBox
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: "", label: "All" }, ...statusOptions]}
          />
        </Grid>
      </Grid>

      {/* List */}
      <Box
        sx={{
          border: "1px solid #eee",
          borderRadius: 2,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 140px 200px 160px",
            gap: 0,
            p: 1.2,
            bgcolor: "#f4f6f8",
            fontWeight: 600,
          }}
        >
          <div>ID</div>
          <div>Name / Slug</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>Loading…</Box>
        ) : current.length ? (
          current.map((row) => (
            <Box
              key={row.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 140px 200px 160px",
                alignItems: "center",
                p: 1.2,
                borderTop: "1px solid #eee",
                fontSize: 14,
              }}
            >
              <div>{row.id}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{row.name}</div>
                <div style={{ color: "#6b7280" }}>{row.slug}</div>
              </div>
              <div>{row.status}</div>
              <div title={row.created_at}>
                {row.created_at ? dayjs(row.created_at).format("LLL") : "-"}
              </div>
              <div>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </Button>
                &nbsp;&nbsp;
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </Button>
              </div>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 2, color: "#777" }}>No stores found.</Box>
        )}
      </Box>

      {/* Pagination */}
      <Grid container justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, v) => setPage(v)}
          color="primary"
        />
      </Grid>

      {/* Optional Drawer */}
      <CustomDrawer
        anchor="right"
        isOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        renderContent={() => (
          <Box sx={{ p: 2, width: 360 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Edit Settings (JSON)
            </Typography>
            <TextInput
              label="Settings"
              multiline
              rows={14}
              value={form.settings}
              onChange={(e) => setField("settings", e.target.value)}
            />
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button variant="outlined" onClick={toggleDrawer(false)}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      />

      {/* Example modal (unused but wired if you want confirmations) */}
      <ModalBox open={false} handleClose={() => {}} direction="up" />
    </Box>
  );
}
