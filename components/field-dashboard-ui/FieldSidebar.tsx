"use client";

import type { FieldFeature, SelectedField } from "@/lib/types";

interface FieldSidebarProps {
  isOpen: boolean;
  fields: FieldFeature[];
  selectedField: SelectedField | null;
  onFieldClick: (field: FieldFeature) => void;
  onDeleteField: (fieldId: string, e: React.MouseEvent) => void;
}

export default function FieldSidebar({
  isOpen,
  fields,
  selectedField,
  onFieldClick,
  onDeleteField,
}: FieldSidebarProps) {
  return (
    <div className={`field-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3>My Fields</h3>
        <span className="field-count">{fields.length}</span>
      </div>

      <div className="field-list">
        {fields.length === 0 ? (
          <div className="no-fields">
            Draw a polygon on the map to add a field
          </div>
        ) : (
          fields.map((field) => {
            const fieldId = field.properties?.id;
            const isActive = selectedField?.id === fieldId?.toString();

            return (
              <div
                key={fieldId || Math.random()}
                className={`field-item ${isActive ? "active" : ""}`}
                onClick={() => onFieldClick(field)}
              >
                <div className="field-info">
                  <span className="field-name">
                    {field.properties?.name || `Field ${fieldId}`}
                  </span>
                  <span className="field-area">
                    {field.properties?.area
                      ? `${Number(field.properties.area).toFixed(2)} ha`
                      : "Area N/A"}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => onDeleteField(fieldId?.toString() || "", e)}
                  title="Delete field"
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .field-sidebar {
          position: absolute;
          top: 22%;
          right: 100px;
          width: 260px;
          max-height: 50%;
          background: rgba(10, 22, 40, 0.95);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
          display: flex;
          flex-direction: column;
          overflow: hidden !important;
          transform: translateX(200px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .field-sidebar.open {
          transform: translateX(50px);
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h3 {
          margin: 0;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }

        .field-count {
          background: #0ea5e9;
          color: #fff;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .field-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .field-list::-webkit-scrollbar {
          width: 4px;
        }

        .field-list::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }

        .no-fields {
          color: #64748b;
          font-size: 12px;
          text-align: center;
          padding: 20px 10px;
        }

        .field-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .field-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .field-item.active {
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.5);
        }

        .field-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .field-name {
          color: #fff;
          font-size: 13px;
          font-weight: 500;
        }

        .field-area {
          color: #9ca3af;
          font-size: 11px;
        }

        .delete-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          opacity: 0.6;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
