import { Stack, IconButton, Tooltip } from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

interface AppActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
}

export function AppActions({
  onView,
  onEdit,
  onDelete,
  viewTooltip = "View",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
}: AppActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      {onView && (
        <Tooltip title={viewTooltip}>
          <IconButton size="small" onClick={onView}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton size="small" onClick={onEdit}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton
            size="small"
            color="error"
            onClick={onDelete}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}