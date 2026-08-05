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
}

export function AppActions({
  onView,
  onEdit,
  onDelete,
}: AppActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      {onView && (
        <Tooltip title="View">
          <IconButton size="small" onClick={onView}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete">
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