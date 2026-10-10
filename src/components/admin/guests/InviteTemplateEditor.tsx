import { useState } from "react";
import type { InviteMessageTemplate } from "../../../config/invite-templates";
import { getInviteTemplateById } from "../../../config/invite-templates";
import { INVITE_TEMPLATE_VARIABLES } from "../../../lib/invite-links";
import type { WeddingConfig } from "../../../config/wedding.config";

type InviteCopy = WeddingConfig["invite"];

type Props = {
  invite: InviteCopy;
  templates: InviteMessageTemplate[];
  onTemplatesChange: (templates: InviteMessageTemplate[]) => void;
  onDefaultTemplateChange: (templateId: string) => void;
  onSalutationChange: (value: string) => void;
};

export function InviteTemplateEditor({
  invite,
  templates,
  onTemplatesChange,
  onDefaultTemplateChange,
  onSalutationChange,
}: Props) {
  const [editingTemplateId, setEditingTemplateId] = useState(invite.defaultTemplateId);
  const editingTemplate = getInviteTemplateById(templates, editingTemplateId);

  const updateTemplate = (templateId: string, patch: Partial<InviteMessageTemplate>) => {
    onTemplatesChange(
      templates.map((item) => (item.id === templateId ? { ...item, ...patch } : item)),
    );
  };

  const appendVariableToTemplate = (templateId: string, variable: string) => {
    const template = getInviteTemplateById(templates, templateId);
    updateTemplate(templateId, { message: `${template.message}{${variable}}` });
  };

  return (
    <aside className="admin-invite__side">
      <fieldset className="admin-fieldset admin-fieldset--compact admin-invite__template">
        <legend>{invite.templateLabel}</legend>

        <div className="admin-invite__template-meta">
          <label className="admin-field">
            <span className="admin-label">{invite.defaultTemplateLabel}</span>
            <select
              className="admin-input"
              value={invite.defaultTemplateId}
              onChange={(e) => onDefaultTemplateChange(e.target.value)}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-label">Salam ({`{salam}`})</span>
            <input
              className="admin-input"
              value={invite.salutation}
              onChange={(e) => onSalutationChange(e.target.value)}
            />
          </label>
        </div>

        <div className="admin-invite__tabs" role="tablist" aria-label="Template pesan">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              role="tab"
              aria-selected={editingTemplateId === template.id}
              className={`admin-invite__tab${editingTemplateId === template.id ? " admin-invite__tab--active" : ""}`}
              onClick={() => setEditingTemplateId(template.id)}
            >
              {template.name}
            </button>
          ))}
        </div>

        <label className="admin-field admin-field--wide">
          <span className="admin-label">{invite.templateNameLabel}</span>
          <input
            className="admin-input"
            value={editingTemplate.name}
            onChange={(e) => updateTemplate(editingTemplateId, { name: e.target.value })}
          />
        </label>

        <div className="admin-invite__vars">
          {INVITE_TEMPLATE_VARIABLES.map((item) => (
            <button
              key={`${editingTemplateId}-${item.key}`}
              type="button"
              className="admin-invite__var"
              onClick={() => appendVariableToTemplate(editingTemplateId, item.key)}
            >
              {`{${item.key}}`}
            </button>
          ))}
        </div>

        <label className="admin-field admin-field--wide">
          <span className="admin-label">{invite.templateMessageLabel}</span>
          <textarea
            className="admin-input admin-invite__message"
            rows={14}
            value={editingTemplate.message}
            onChange={(e) => updateTemplate(editingTemplateId, { message: e.target.value })}
          />
        </label>
      </fieldset>
    </aside>
  );
}
